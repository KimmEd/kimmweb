const express = require("express"),
    router = express.Router();

router.get('/studyset', (req, res) => {
    const Class = require("../models/class");
    const { id, studySetId } = req.query;
    Class.findById(id).exec((err, classObj) => {
        if (err || !classObj) {
            return res.status(404).json({
                message: "Class not found"
            })
        } else {
            if (!classObj.studysets) {
                return res.status(404).json({
                    message: "No study sets found"
                })
            } else {
                const studySet = classObj.studysets.filter(studySet => studySet._id.toString() === studySetId)[0];
                return res.status(200).json({
                    studySet
                })
            }
        }
    })          
})

module.exports = router;