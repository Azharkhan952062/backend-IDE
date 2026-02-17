const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const projectModel = require("../models/projectModel");
var jwt = require("jsonwebtoken");

const secret = "secret";

function getStarterCode(language) {

    if (language === "python") {
        return 'print("Hello World")';
    }
    else if (language === "java") {
        return `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`;
    }
    else if (language === "javascript") {
        return 'console.log("Hello World");';
    }
    else if (language === "c++") {
        return `#include <iostream>
using namespace std;

int main() {
  cout << "Hello World";
  return 0;
}`;
    }
    else if (language === "c") {
        return `#include <stdio.h>

int main() {
  printf("Hello World");
  return 0;
}`;
    }
    else if (language === "go") {
        return `package main
import "fmt"

func main() {
  fmt.Println("Hello World")
}`;
    }
    else if (language === "bash") {
        return 'echo "Hello World"';
    }
    else {
        return "// Language not supported";
    }

};

exports.signUp = async (req, res) => {
    try {
        let { email, pwd, fullName } = req.body;

        let emailCon = await userModel.findOne({ email: email });
        if (emailCon) {
            return res.status(400).json({
                success: false,
                msg: "Email already exist"
            })
        }

        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(pwd, salt, async function (err, hash) {

                let user = await userModel.create({
                    email: email,
                    password: hash,
                    fullName: fullName
                });

                return res.status(200).json({
                    success: true,
                    msg: "User created successfully",
                });
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {

        let { email, pwd } = req.body;

        let user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }
        bcrypt.compare(pwd, user.password, function (err, result) {
            if (result) {

                let token = jwt.sign({ userId: user._id }, secret)

                return res.status(200).json({
                    success: true,
                    msg: "User logged in successfully",
                    token
                });
            } else {
                return res.status(401).json({
                    success: false,
                    msg: "Invalid password"
                });
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }
};

exports.createProj = async (req, res) => {
    try {
        let { name, projectLanguage, token, version } = req.body;

        // SAFE TOKEN VERIFY (main fix)
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(401).json({
                success: false,
                msg: "Token missing or expired"
            });
        }

        let user = await userModel.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        };

        let project = await projectModel.create({
            name: name,
            projectLanguage: projectLanguage,
            createdBy: user._id,
            code: getStarterCode(projectLanguage),
            version: version
        });

        return res.status(200).json({
            success: true,
            msg: "Project created successfully",
            projectId: project._id
        });

    } catch (error) {
        console.log("CREATE ERROR:", error.message);
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }
};


exports.saveProject = async (req, res) => {
    try {
        let { token, projectId, code } = req.body;
        let decoded = jwt.verify(token, secret);
        let user = await userModel.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        };

        let project = await projectModel.findOne({ _id: projectId });
        project.code = code;
        await project.save();

        return res.status(200).json({
            success: true,
            msg: "Project saved successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }
};

exports.getProjects = async (req, res) => {
    try {
        let { token } = req.body;
        let decoded = jwt.verify(token, secret);
        let user = await userModel.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }
        let projects = await projectModel.find({ createdBy: user._id });

        return res.status(200).json({
            success: true,
            msg: "Project fetched successfully",
            projects: projects
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }

};

exports.getProject = async (req, res) => {
    try {
        let { token, projectId } = req.body;
        let decoded = jwt.verify(token, secret);
        let user = await userModel.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        let project = await projectModel.findOne({ _id: projectId });

        if (project) {
            return res.status(200).json({
                success: true,
                msg: "project fetched successfully",
                project: project
            });
        } else {
            return res.status(404).json({
                success: false,
                msg: "project not found"
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }
};

exports.deleteProject = async (req, res) => {
    try {
        let { token, projectId } = req.body;
        let decoded = jwt.verify(token, secret);
        let user = await userModel.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }
        let project = await projectModel.findOneAndDelete({ _id: projectId });

        return res.status(200).json({
            success: true,
            msg: "Project deleted successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }
};

exports.editProject = async (req, res) => {
    try {
        let { token, projectId, name } = req.body;
        let decoded = jwt.verify(token, secret);
        let user = await userModel.findOne({ _id: decoded.userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        };
        let project = await projectModel.findOne({ _id: projectId });
        if (project) {
            project.name = name;
            await project.save();
            return res.status(200).json({
                success: true,
                msg: "Project edit successfully"
            })
        }
        else {
            return res.status(404).json({
                success: false,
                msg: "Project not found"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        })
    }
};
