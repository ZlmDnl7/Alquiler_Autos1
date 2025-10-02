export const adminAuth = async (req,res,next)=> {
    try{
        if(req.user.isAdmin){
            res.status(200).json({message:"admin loged in successfully"})
        }
        else{
            res.status(403).json({message:"only acces for admins"})
        }
        
    }
    catch(error){
        next(error)
    }
}

export const adminProfiile = async (req,res,next)=> {
    try{
        // Obtener información del perfil del admin
        const adminProfile = {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
            createdAt: req.user.createdAt
        };
        
        res.status(200).json({
            message: "Admin profile retrieved successfully",
            profile: adminProfile
        });
    }
    catch(error){
        next(error)
    }
}

