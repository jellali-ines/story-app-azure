
const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require("form-data");
const asyncHandler = require("express-async-handler");

const _SERVICE = `${process.env.ADMIN_SERVICE_URL}/api/admin`;
const upload =require("../../middleware/upload"); 

router.get("/stories", asyncHandler(async (req, res) => {
    const { page, limit } = req.query;

    const response = await axios.get(`${process.env.STORY_SERVICE_URL}/stories`, {
        params: { page, limit },
        headers: {
            Authorization: req.headers.authorization // forward le token
        }
    });

    return res.status(response.status).json(response.data);
}));


router.get("/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await axios.get(`${process.env.STORY_SERVICE_URL}/story/${id}`, {
        headers: {
            Authorization: req.headers.authorization
        }
    });

    return res.status(response.status).json(response.data);
}));


router.post(
    "/add",
    upload.fields([
        { name: "wavFile", maxCount: 1 },
        { name: "image", maxCount: 1 }
    ]),
    asyncHandler(async (req, res) => {
        const formData = new FormData();

        for (let key in req.body) {
            formData.append(key, req.body[key]);
        }

        formData.append("wavFile", req.files.wavFile[0].buffer, req.files.wavFile[0].originalname);
        if (req.files.image) {
            formData.append("image", req.files.image[0].buffer, req.files.image[0].originalname);
        }

        const response = await axios.post(`${process.env.STORY_SERVICE_URL}/story/add`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: req.headers.authorization // forward token
            }
        });

        return res.status(response.status).json(response.data);
    })
);


router.put(
    "/:id/update",
    upload.fields([
        { name: "wavFile", maxCount: 1 },
        { name: "image", maxCount: 1 }
    ]),
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const formData = new FormData();

        for (let key in req.body) {
            formData.append(key, req.body[key]);
        }

        if (req.files.wavFile) {
            formData.append("wavFile", req.files.wavFile[0].buffer, req.files.wavFile[0].originalname);
        }

        if (req.files.image) {
            formData.append("image", req.files.image[0].buffer, req.files.image[0].originalname);
        }

        const response = await axios.put(`${process.env.STORY_SERVICE_URL}/story/${id}/update`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: req.headers.authorization // forward token
            }
        });

        return res.status(response.status).json(response.data);
    })
);


router.delete("/:id/delete", asyncHandler(async (req, res) => {
    const { id } = req.params;

    const response = await axios.delete(`${process.env.STORY_SERVICE_URL}/story/${id}/delete`, {
        headers: {
            Authorization: req.headers.authorization
        }
    });

    return res.status(response.status).json(response.data);
}));





module.exports = router;
