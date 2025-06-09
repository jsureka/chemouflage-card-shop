#!/usr/bin/env node

/**
 * Cloudinary Upload Script
 *
 * This script helps upload images from the public folder to Cloudinary
 * and generates the correct image mapping for the application.
 *
 * Usage:
 * 1. Install dependencies: npm install cloudinary dotenv
 * 2. Set up your .env file with Cloudinary credentials
 * 3. Run: node scripts/upload-to-cloudinary.js
 */

const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PUBLIC_FOLDER = path.join(__dirname, "../public");
const UPLOAD_FOLDER = "chemouflage";

// Image files to upload (add more extensions as needed)
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];

// Function to convert filename to Cloudinary public ID
function filenameToPublicId(filename) {
  const nameWithoutExt = path.parse(filename).name;
  // Replace spaces and special characters with underscores
  return nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
}

// Function to upload a single image
async function uploadImage(filePath, filename) {
  try {
    const publicId = `${UPLOAD_FOLDER}/${filenameToPublicId(filename)}`;

    console.log(`Uploading ${filename} as ${publicId}...`);

    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      overwrite: true,
      resource_type: "auto",
    });

    console.log(`✅ Uploaded: ${result.secure_url}`);
    return { filename, publicId, url: result.secure_url };
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error.message);
    return null;
  }
}

// Main upload function
async function uploadAllImages() {
  try {
    // Check if Cloudinary is configured
    if (
      !process.env.VITE_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("❌ Cloudinary credentials not found in .env file");
      console.log("Please add the following to your .env file:");
      console.log("VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name");
      console.log("CLOUDINARY_API_KEY=your_api_key");
      console.log("CLOUDINARY_API_SECRET=your_api_secret");
      return;
    }

    // Read public folder
    const files = fs.readdirSync(PUBLIC_FOLDER);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log("No image files found in public folder");
      return;
    }

    console.log(`Found ${imageFiles.length} image files to upload...`);
    console.log("─────────────────────────────────────────────────");

    const results = [];

    // Upload each image
    for (const filename of imageFiles) {
      const filePath = path.join(PUBLIC_FOLDER, filename);
      const result = await uploadImage(filePath, filename);
      if (result) {
        results.push(result);
      }
    }

    console.log("─────────────────────────────────────────────────");
    console.log(
      `✅ Upload complete! ${results.length}/${imageFiles.length} files uploaded successfully.`
    );

    // Generate image map for the application
    generateImageMap(results);
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
  }
}

// Function to generate the image map for the application
function generateImageMap(results) {
  console.log("\n📝 Generated Image Map for cloudinary.ts:");
  console.log("─────────────────────────────────────────────────");

  const imageMap = {};
  results.forEach(({ filename, publicId }) => {
    imageMap[filename] = publicId;
  });

  console.log("export const imageMap = {");
  Object.entries(imageMap).forEach(([filename, publicId]) => {
    console.log(`  '${filename}': '${publicId}',`);
  });
  console.log("} as const;");

  // Save to file
  const mapContent = `// Auto-generated image map
export const imageMap = {
${Object.entries(imageMap)
  .map(([filename, publicId]) => `  '${filename}': '${publicId}',`)
  .join("\n")}
} as const;
`;

  fs.writeFileSync(
    path.join(__dirname, "../src/config/image-map-generated.ts"),
    mapContent
  );
  console.log("\n💾 Image map saved to src/config/image-map-generated.ts");
  console.log("📋 Copy the imageMap object to your cloudinary.ts file");
}

// Run the upload script
if (require.main === module) {
  uploadAllImages().catch(console.error);
}

module.exports = {
  uploadAllImages,
  uploadImage,
  filenameToPublicId,
};
