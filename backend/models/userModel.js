import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber:{
      type:String,
      // Removido unique: true porque causa problemas con valores null
      sparse: true, // Solo indexa documentos que tengan este campo
      required: false, // No es requerido
      // No incluir en el documento si no se proporciona
    },
    adress:{
      type:String,
    },
    password: {
      type: String,
      required: true,
    },

    profilePicture: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=",
    },
    isUser: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVendor: {
      type: Boolean,
      default: false,
    },
    refreshToken:{
      type:String,
      default:""
    }
  },
  { 
    timestamps: true,
    strict: false // No incluir campos undefined automáticamente
  }
);

const User = mongoose.model("User", userSchema);

export default User;
