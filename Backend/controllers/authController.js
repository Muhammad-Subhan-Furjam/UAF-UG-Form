// =====================
// Get Logged In User Profile
// =====================

const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("campus_id")
      .populate("faculty_id")
      .populate("department_id")
      .populate("degree_id");


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    res.status(200).json({
      user
    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }
};