const mailer = require("nodemailer");
const { VsAuthenticator } = require("@vs-org/authenticator");
const OTPCashe = {};

exports.SendOTP = async (email) => {
  const code = VsAuthenticator.generateTOTP(process.env.OTP_SECRET);
  OTPCashe[code] = email;
//   const html = `
//   <div style="max-width: 600px;  margin: 0 auto;">
//   <form style="background-color: #272727; height: 650px; padding: 20px;">
//     <img style="display: block; margin: 0 auto; width: 200px"; height: "200px;" src="https://i.imgur.com/RElBCJa.jpeg" controls="false" alt="Logo" style="display: block; margin: 0 auto;">
//     <div style="position: relative; margin-top: 20px; text-align: center;">
//         <h2 style="width: 300px; color: #FFFFFF; padding: 10px 20px; display: inline-block; border-radius: 5px;">Your OTP Code is : </h2>
//         <h2 style="width: 300px; background-color: #804fdf; color: #FFFFFF; padding: 10px 20px; display: inline-block; border-radius: 5px;">${code}</h2>
//     </div>
//     <p style="text-align: center; margin-top: 20px; font-size: 24px; color: #FFFFFF">Our Stores</p>
//   </form>
// </div>
// `;
  const transporter = new mailer.createTransport({
    service: "gmail",
    auth: {
      user: "drweeeotp@gmail.com",
      pass: "ljlecdmapgvqmhfx",
    },
  });
  const options = {
    from: "ourstoresotp@gmail.com",
    to: `${email}`,
    subject: "Reset Password Request From DR WEE.",
    text: `Your OTP is ${code}  Valid For 60 min`,
    // html: html,
  };
  return await transporter.sendMail(options);
};

exports.VerifyOTP = async (OTP, email) => {
  const cashedEmail = OTPCashe[OTP];
  if (cashedEmail === email) {
    VsAuthenticator.verifyTOTP(OTP, process.env.OTP_SECRET);
    delete OTPCashe[OTP];
    return true;
  }
  else {
    throw new Error("Invalid Email Or OTP")
  }
};
