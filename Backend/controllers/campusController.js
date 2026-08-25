const Campus = require("../models/Campus");


const getCampuses = async (req, res) => {

    try {

        const campuses = await Campus.find({
            status:true
        });

        res.status(200).json(campuses);

    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



const addCampus = async (req,res)=>{

    try{

        const campus = await Campus.create(req.body);

        res.status(201).json({
            message:"Campus Added Successfully",
            campus
        });


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};



module.exports = {
    getCampuses,
    addCampus
};