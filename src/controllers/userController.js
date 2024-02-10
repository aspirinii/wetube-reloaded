import User from "../models/User";
import Video from "../models/Video";

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate("videos");

        if (!user) {
            return res
                .status(404)
                .render("404", { pageTitle: "User not found." });
        }

        return res.render("users/profile", {
            pageTitle: `User profile : ${user.username}`,
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).render("404", { pageTitle: "User not found." });
    }
};
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
    try {
        const { name, username, email, password, password2, location } =
            req.body;
        if (password !== password2) {
            return res.status(400).render("join", {
                pageTitle: "Join",
                errorMessage: "Password confirmation does not match.",
            });
        }
        const exists = await User.exists({
            $or: [{ username }, { email }],
        }); // $or : [{username}, {email}] 이렇게 써도 됨
        if (exists) {
            return res.status(400).render("join", {
                pageTitle: "Join",
                errorMessage: "This username or email is already taken.",
            });
        }
    
        const hashedPassword = await User.hashing(password);

        await User.create({
            // name,
            username,
            email,
            password: hashedPassword,
            // location,
        });

        return res.redirect("/login");
    } catch (error) {
        console.log(error);
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: error._message,
        });
    }
};
export const getLogin = (req, res) =>
    res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const exists = await User.exists({
            $or: [{ username }],
        });
        if (!exists) {
            return res.status(400).render("login", {
                pageTitle: "Login",
                errorMessage: "This username isn't exist.",
            });
        } else {
            const user = await User.findOne({ username, socialOnly: false });
            const ok = await User.compare(password, user.password);
            if (!ok) {
                return res.status(400).render("login", {
                    pageTitle: "Login",
                    errorMessage: "Wrong password.",
                });
            }
            req.session.loggedIn = true;
            req.session.user = user;

            return res.redirect("/"); //res.reder 는 동작이상, res.redirect는  refresh 됨
        }
    } catch (error) {
        console.log(error);
        return res.status(400).render("login", {
            pageTitle: "Login",
            errorMessage: "Something went wrong.",
        });
    }
};
export const getProfileEdit = (req, res) => {
    if (req.session.user) {
        return res.render("edit-profile", { pageTitle: "Edit Profile" });
    } else {
        return res.redirect("/login");
    }
};
export const postProfileEdit = async (req, res) => {
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { username },
        file,
    } = req;
    // const currentUserID = req.session.user._id;
    console.log("req.file :", req.file);
    const upadateSessionUser = await User.findByIdAndUpdate(
        _id,
        {
            avatarUrl: file ? file.path : avatarUrl,
            username,
        },
        { new: true } // return updated object, option of findByIdAndUpdate

    );

    req.session.user = upadateSessionUser;
    // console.log("upload file: ", req.file);

    return res.redirect("/");
};
export const postLogout = (req, res) => {
    req.flash("info", "Bye Bye");
    req.session.destroy();
    return res.redirect("/");
};
export const startGithubLogin = (req, res) => {
    const config = {
        client_id: process.env.GITHUB_CLIENT_ID,
        allow_Signup: true,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const baseUrl = "https://github.com/login/oauth/authorize";
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async (req, res) => {
    const config = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: req.query.code,
    };
    const baseUrl = "https://github.com/login/oauth/access_token";
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    if ("access_token" in tokenRequest) {
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        // console.log(userData);
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        // console.log(emailData);
        //check if login email is verified and primary
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
            //create an account
            user = await User.create({
                avatarUrl: userData.avatar_url,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                name: userData.name,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
        //not use render but redirect with error message with "notification option"
    }
};

export const getChangePassword = (req, res) => {
    if (!req.session.user.socialOnly) {
        return res.render("users/change-password", {
            pageTitle: "Change Password",
        });
    } else {
        return res.redirect("/login");
    }
};

export const postChangePassword = async (req, res) => {
    // send notification
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, verifyPassword },
    } = req;
    const user = await User.findById(_id);
    const ok = await User.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect.",
        });
    }
    if (newPassword !== verifyPassword) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The password does not match the confirmation.",
        });
    }
    user.password = await User.hashing(newPassword);
    await user.save();
    // send notification
    return res.redirect("/users/edit");
};
