"""
Timing utilities for profiling slow operations.
"""
import time
import logging
from functools import wraps
from typing import Callable, Any

logger = logging.getLogger(__name__)

def profile_operation(operation_name: str = None, log_threshold_ms: float = 100.0):
    """
    Decorator to profile operation timing and log slow operations.
    
    Args:
        operation_name: Custom name for the operation (defaults to function name)
        log_threshold_ms: Minimum time in milliseconds to log (default: 100ms)
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            name = operation_name or f"{func.__module__}.{func.__name__}"
            start_time = time.perf_counter()
            
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                end_time = time.perf_counter()
                duration_ms = (end_time - start_time) * 1000
                
                if duration_ms >= log_threshold_ms:
                    logger.info(f"SLOW_OPERATION: {name} took {duration_ms:.2f}ms")
                else:
                    logger.debug(f"OPERATION: {name} took {duration_ms:.2f}ms")
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            name = operation_name or f"{func.__module__}.{func.__name__}"
            start_time = time.perf_counter()
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                end_time = time.perf_counter()
                duration_ms = (end_time - start_time) * 1000
                
                if duration_ms >= log_threshold_ms:
                    logger.info(f"SLOW_OPERATION: {name} took {duration_ms:.2f}ms")
                else:
                    logger.debug(f"OPERATION: {name} took {duration_ms:.2f}ms")
        
        # Return appropriate wrapper based on whether function is async
        if hasattr(func, '__code__') and func.__code__.co_flags & 0x80:  # CO_COROUTINE
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

def time_operation(operation_name: str) -> float:
    """
    Context manager for timing operations.
    Returns the duration in milliseconds.
    """
    class TimingContext:
        def __init__(self, name: str):
            self.name = name
            self.start_time = None
            self.duration_ms = None
        
        def __enter__(self):
            self.start_time = time.perf_counter()
            return self
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            end_time = time.perf_counter()
            self.duration_ms = (end_time - self.start_time) * 1000
            
            if self.duration_ms >= 100.0:
                logger.info(f"SLOW_OPERATION: {self.name} took {self.duration_ms:.2f}ms")
            else:
                logger.debug(f"OPERATION: {self.name} took {self.duration_ms:.2f}ms")
    
    return TimingContext(operation_name)