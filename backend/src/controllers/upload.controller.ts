import { Response } from "express";
import { CloudinaryService } from "../services/cloudinary.service";
import { AuthRequest } from "../middleware/auth";
import { handleControllerError, sendError } from "../utils/http";

export class UploadController {
  static async uploadImage(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return sendError(res, 400, "No file uploaded", "NO_FILE_UPLOADED");
      }

      const result = await CloudinaryService.uploadImage(req.file.buffer);
      res.status(201).json(result);
    } catch (error) {
      handleControllerError(res, error, "Failed to upload image", "IMAGE_UPLOAD_FAILED");
    }
  }
}
