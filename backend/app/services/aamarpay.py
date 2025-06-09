import hashlib
import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

import requests
from app.core.config import settings

# Setup logging
logger = logging.getLogger(__name__)


class AamarPayService:
    """
    AamarPay payment gateway service for processing payments
    Based on the official aamarpay-python package with enhancements
    """
    
    def __init__(self):
        # Configuration from environment variables
        self.is_sandbox = getattr(settings, 'AAMARPAY_SANDBOX', True)
        self.store_id = getattr(settings, 'AAMARPAY_STORE_ID', 'aamarpaytest')
        self.signature_key = getattr(settings, 'AAMARPAY_SIGNATURE_KEY', 'dbb74894e82415a2f7ff0ec3a97e4183')
          # URLs
        self.sandbox_url = 'https://sandbox.aamarpay.com/jsonpost.php'
        self.production_url = 'https://secure.aamarpay.com/jsonpost.php'
        
        # Default callback URLs (will be overridden with actual URLs)
        self.base_url = getattr(settings, 'BACKEND_URL', 'http://localhost:8000')
        self.frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        
    def get_payment_url(self) -> str:
        """Get the appropriate payment URL based on environment"""
        return self.sandbox_url if self.is_sandbox else self.production_url
    
    def generate_transaction_id(self) -> str:
        """Generate a unique transaction ID"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_suffix = str(uuid.uuid4())[:8]
        return f"TXN{timestamp}{random_suffix}"
    
    def create_payment(
        self,
        order_id: str,
        amount: float,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        customer_address: str = "",
        customer_city: str = "",
        description: str = "Order Payment"
    ) -> Dict[str, Any]:
        """
        Create a payment request and get payment URL
        
        Args:
            order_id: Unique order identifier
            amount: Payment amount
            customer_name: Customer's full name
            customer_email: Customer's email
            customer_phone: Customer's phone number
            customer_address: Customer's address (optional)
            customer_city: Customer's city (optional)
            description: Payment description (optional)
            
        Returns:
            Dict containing payment_url, transaction_id, and status
        """
        try:
            # Generate unique transaction ID
            transaction_id = self.generate_transaction_id()
            
            # Prepare callback URLs
            success_url = f"{self.base_url}/api/v1/payments/aamarpay/success"
            fail_url = f"{self.base_url}/api/v1/payments/aamarpay/fail"
            cancel_url = f"{self.base_url}/api/v1/payments/aamarpay/cancel"            # Prepare payload
            payload = {
                "store_id": self.store_id,
                "tran_id": transaction_id,
                "success_url": success_url,
                "fail_url": fail_url,
                "cancel_url": cancel_url,
                "amount": str(amount),
                "currency": "BDT",
                "signature_key": self.signature_key,
                "desc": description,
                "cus_name": customer_name,
                "cus_email": customer_email,
                "cus_add1": customer_address,
                "cus_add2": "",
                "cus_city": customer_city,
                "cus_state": "",
                "cus_postcode": "",
                "cus_country": "Bangladesh",
                "cus_phone": customer_phone,
                "type": "json",
                "opt_a": order_id,  # Store order ID for reference
                "opt_b": "",
                "opt_c": "",
                "opt_d": ""
            }
            
            # Prepare headers for JSON request
            headers = {
                'Content-Type': 'application/json'
            }
              # Make request to AamarPay with JSON payload
            logger.info(f"Sending payment request to AamarPay for order {order_id}")
            logger.debug(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                self.get_payment_url(), 
                headers=headers,
                json=payload,  # Use json parameter instead of data
                timeout=30
            )
            
            logger.info(f"AamarPay response status: {response.status_code}")
            logger.debug(f"AamarPay response body: {response.text}")
            
            if response.status_code == 200:
                try:
                    response_data = response.json()
                    logger.info(f"Successfully parsed JSON response: {response_data}")
                    
                    if "payment_url" in response_data:
                        return {
                            "success": True,
                            "payment_url": response_data["payment_url"],
                            "transaction_id": transaction_id,
                            "order_id": order_id,
                            "amount": amount,
                            "currency": "BDT"
                        }
                    else:
                        logger.error(f"No payment_url in response: {response_data}")
                        return {
                            "success": False,
                            "error": "Payment URL not received from AamarPay",
                            "raw_response": response.text
                        }
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON response: {e}")
                    logger.error(f"Raw response: {response.text}")
                    return {
                        "success": False,
                        "error": "Invalid JSON response from AamarPay",
                        "raw_response": response.text
                    }
            else:
                logger.error(f"HTTP error {response.status_code}: {response.text}")
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "raw_response": response.text
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def verify_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify payment callback from AamarPay
        
        Args:
            payment_data: Data received from AamarPay callback
            
        Returns:
            Dict containing verification result and payment details
        """
        try:
            # Extract required fields
            pay_status = payment_data.get("pay_status")
            amount = payment_data.get("amount")
            transaction_id = payment_data.get("mer_txnid")
            aamarpay_transaction_id = payment_data.get("pg_txnid")
            order_id = payment_data.get("opt_a")
            
            # Verify signature if provided
            received_signature = payment_data.get("signature_key")
            if received_signature:
                # Create verification string (this might need adjustment based on AamarPay docs)
                verification_string = f"{self.store_id}{transaction_id}{amount}{self.signature_key}"
                calculated_signature = hashlib.md5(verification_string.encode()).hexdigest()
                
                if received_signature.lower() != calculated_signature.lower():
                    return {
                        "success": False,
                        "error": "Signature verification failed",
                        "payment_status": "failed"
                    }
            
            # Determine payment status
            if pay_status == "Successful":
                payment_status = "success"
            elif pay_status == "Failed":
                payment_status = "failed"
            elif pay_status == "Cancelled":
                payment_status = "cancelled"
            else:
                payment_status = "pending"
            
            return {
                "success": True,
                "payment_status": payment_status,
                "transaction_id": transaction_id,
                "aamarpay_transaction_id": aamarpay_transaction_id,
                "order_id": order_id,
                "amount": float(amount) if amount else 0,
                "pay_status": pay_status,
                "currency": payment_data.get("currency", "BDT"),
                "payment_date": payment_data.get("date"),
                "raw_data": payment_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Payment verification error: {str(e)}",
                "payment_status": "failed"
            }
    
    def check_payment_status(self, transaction_id: str) -> Dict[str, Any]:
        """
        Check payment status using AamarPay API
        
        Args:
            transaction_id: Transaction ID to check
            
        Returns:
            Dict containing payment status and details
        """
        try:
            # This endpoint might need to be updated based on AamarPay's actual API
            status_url = f"{self.get_payment_url()}/api/v1/trxcheck/request.php"
            
            payload = {
                "store_id": self.store_id,
                "signature_key": self.signature_key,
                "type": "json",
                "tran_id": transaction_id
            }
            
            response = requests.post(status_url, data=payload, timeout=30)
            
            if response.status_code == 200:
                try:
                    response_data = response.json()
                    return {
                        "success": True,
                        "data": response_data
                    }
                except json.JSONDecodeError:
                    return {
                        "success": False,
                        "error": "Invalid JSON response",
                        "raw_response": response.text
                    }
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Status check error: {str(e)}"
            }


# Create a singleton instance
aamarpay_service = AamarPayService()