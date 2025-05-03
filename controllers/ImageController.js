
const Student = require("../models/StudentModel.js"); 
const { uploadimage } = require("../middleware/FileUpload.js"); 
const fs = require("fs");
const path = require("path"); 
const { Sequelize } = require('sequelize');


exports.uploadStudentImage = (req, res) => {
  // Calling Multer middleware to handle file upload
  uploadimage(req, res, function (err) {
      if (err) {
          console.error("Multer error:", err);
          return res.status(500).json({ message: err.message });
      }
      if (!req.files || !req.files['image'] || !req.files['identityImage']) {
          console.log("Request:", req);
          return res.status(400).json({ message: "Both images are required" });
      }

      console.log("Uploaded files:", req.files);

      // Log the student ID from the request parameters
      console.log("Student ID:", req.params.studentId);

      // Check if the student exists
      Student.findByPk(req.params.studentId)
          .then((student) => {
              if (!student) {
                  console.log("Student not found with ID:", req.params.studentId);
                  return res.status(404).json({ message: "Student not found" });
              }

              console.log("Found student:", student);

              // If images are uploaded, save image paths to database
              student.update({
                  photo: req.files['image'][0].path,
                  identityImage: req.files['identityImage'][0].path
              })
                  .then((updatedStudent) => {
                      console.log("Updated student:", updatedStudent);
                      res.status(200).json({
                          message: "Images uploaded successfully",
                          student: updatedStudent,
                      });
                  })
                  .catch((error) => {
                      console.error("Failed to update student images:", error);
                      res.status(500).json({ message: "Failed to update student images", error });
                  });
          })
          .catch((error) => {
              console.error("Error retrieving student:", error);
              res.status(500).json({
                  message: "Failed to retrieve student information",
                  error: error.message || error,
              });
          });
  });
};


exports.updateStudentImage = (req, res) => {
  // Calling Multer middleware to handle file upload
  uploadimage(req, res, function (err) {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Check if the student exists
    Student.findByPk(req.params.studentId)
      .then((student) => {
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        // Update photo if it exists
        if (req.files['image'] && req.files['image'].length > 0) {
          student.photo = req.files['image'][0].path;
        }

        // Update identity image if it exists
        if (req.files['identityImage'] && req.files['identityImage'].length > 0) {
          student.identityImage = req.files['identityImage'][0].path;
        }

        // Save the updated student record
        student.save()
          .then((updatedStudent) => {
            res.status(200).json({
              message: "Images updated successfully",
              student: updatedStudent,
            });
          })
          .catch((error) => {
            res.status(500).json({ message: "Failed to update student images", error });
          });
      })
      .catch((error) => {
        console.error("Error retrieving student: ", error); // Log the full error
        res.status(500).json({
          message: "Failed to retrieve student information",
          error: error.message || error,
        });
      });
  });
};

  
exports.getStudentPhoto = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Find the student by its studentId
        const student = await Student.findByPk(studentId);

        if (!student || !student.photo) {
            return res.status(404).json({ message: "Student or photo not found" });
        }

        // Assuming photo contains the path of the image
        const photoPath = student.photo;

        // Check if the file exists
        if (!fs.existsSync(photoPath)) {
            return res.status(404).json({ message: "Photo not found" });
        }

        // Set appropriate content type for photo
        const photoContentType = "image/jpeg"; // Assuming JPEG format for images
        res.setHeader("Content-Type", photoContentType);

        // Read the file content for photo
        const photoData = fs.readFileSync(photoPath);

        // Send the photo image data in the response
        res.write(photoData);

        // Close the response
        res.end();
    } catch (error) {
        console.error("Error retrieving student photo:", error);
        res.status(500).json({ message: "Failed to retrieve student photo", error });
    }
};

exports.getStudentIdentityImage = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Find the student by its studentId
        const student = await Student.findByPk(studentId);

        if (!student || !student.identityImage) {
            return res.status(404).json({ message: "Student or identity image not found" });
        }

        // Assuming identityImage contains the path of the image
        const identityImagePath = student.identityImage;

        // Check if the file exists
        if (!fs.existsSync(identityImagePath)) {
            return res.status(404).json({ message: "Identity image not found" });
        }

        // Set appropriate content type for identityImage
        const identityImageContentType = "image/jpeg"; // Assuming JPEG format for images
        res.setHeader("Content-Type", identityImageContentType);

        // Read the file content for identityImage
        const identityImageData = fs.readFileSync(identityImagePath);

        // Send the identityImage data in the response
        res.write(identityImageData);

        // Close the response
        res.end();
    } catch (error) {
        console.error("Error retrieving student identity image:", error);
        res.status(500).json({ message: "Failed to retrieve student identity image", error });
    }
};
 
  exports.downloadImage = async (req, res) => {
    try {
      console.log("Downloading image...");
      const { studentId, imageType } = req.params;
      console.log("Student ID:", studentId);
      console.log("Image Type:", imageType);
  
      // Find the student by its studentId
      const student = await Student.findByPk(studentId);
      console.log("Student:", student);
  
      if (!student) {
        console.log("Student not found");
        return res.status(404).json({ message: "Student not found" });
      }
  
      let imagePath;
      let contentType;
  
      // Determine the image type and set the appropriate path and content type
      if (imageType === 'photo') {
        imagePath = student.photo;
        contentType = "image/jpeg"; // Assuming JPEG format for images
      } else if (imageType === 'identity') {
        imagePath = student.identityImage;
        contentType = "image/jpeg"; // Assuming JPEG format for images
      } else {
        console.log("Invalid image type");
        return res.status(400).json({ message: "Invalid image type" });
      }
  
      // Check if the file exists
      if (!fs.existsSync(imagePath)) {
        console.log("Image not found");
        return res.status(404).json({ message: "Image not found" });
      }
  
      // Set appropriate content type for the image
      res.setHeader("Content-Type", contentType);
  
      // Read the file content for the image
      const imageData = fs.readFileSync(imagePath);
  
      // Send the image data in the response
      res.write(imageData);
  
      // Close the response
      res.end();
    } catch (error) {
      console.error("Error downloading image:", error);
      res.status(500).json({ message: "Failed to download image", error });
    }
  };
    
  exports.deleteStudentImage = (req, res) => {
    const { studentId } = req.params;
  
    // Check if the student exists
    Student.findByPk(studentId)
      .then((student) => {
        if (!student || !student.photo) {
          return res.status(404).json({ message: "Student or image not found" });
        }
  
        // Update student to remove the photo path
        student.update({
          photo: null
        })
        .then(() => {
          res.status(200).json({ message: "Student image deleted successfully" });
        })
        .catch((error) => {
          res.status(500).json({ message: "Failed to delete student image", error });
        });
      })
      .catch((error) => {
        console.error("Error retrieving student:", error);
        res.status(500).json({ message: "Failed to retrieve student", error });
      });
  };
  