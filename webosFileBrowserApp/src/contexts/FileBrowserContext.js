import React, { createContext, useContext, useCallback, useState } from "react";
import LS2Request from "@enact/webos/LS2Request";

const FileBrowserContext = createContext();

const mockFileSystem = {
  "/": {
    type: "directory",
    children: {
      home: { type: "directory", children: {} },
      media: {
        type: "directory",
        children: {
          videos: { type: "directory", children: {} },
          music: { type: "directory", children: {} },
        },
      },
      "test.txt": { type: "file", content: "Hello World!" },
      "sample.json": { type: "file", content: '{"test": "data"}' },
    },
  },
};

const getMockDirectory = (path) => {
  const parts = path.split("/").filter((part) => part !== "");
  let current = mockFileSystem["/"];
  for (const part of parts) {
    if (current.children && current.children[part]) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  if (current.type !== "directory") return null;
  return Object.entries(current.children).map(([name, item]) => ({
    name,
    type: item.type,
    size: item.type === "file" ? item.content.length : undefined,
  }));
};

const getMockFile = (path) => {
  const parts = path.split("/").filter((part) => part !== "");
  let current = mockFileSystem["/"];
  for (const part of parts.slice(0, -1)) {
    if (current.children && current.children[part]) {
      current = current.children[part];
    } else {
      return null;
    }
  }
  const fileName = parts[parts.length - 1];
  const file = current.children?.[fileName];
  return file && file.type === "file" ? file : null;
};

const setMockFile = (path, content) => {
  const parts = path.split("/").filter((part) => part !== "");
  let current = mockFileSystem["/"];
  for (const part of parts.slice(0, -1)) {
    if (!current.children[part]) {
      current.children[part] = { type: "directory", children: {} };
    }
    current = current.children[part];
    if (current.type !== "directory") return false;
  }
  const fileName = parts[parts.length - 1];
  current.children[fileName] = { type: "file", content };
  return true;
};

const deleteMockPath = (path) => {
  const parts = path.split("/").filter((part) => part !== "");
  let current = mockFileSystem["/"];
  for (const part of parts.slice(0, -1)) {
    if (!current.children[part]) return false;
    current = current.children[part];
    if (current.type !== "directory") return false;
  }
  const targetName = parts[parts.length - 1];
  if (!current.children[targetName]) return false;
  delete current.children[targetName];
  return true;
};

const createMockDirectory = (path) => {
  const parts = path.split("/").filter((part) => part !== "");
  let current = mockFileSystem["/"];
  for (const part of parts) {
    if (!current.children[part]) {
      current.children[part] = { type: "directory", children: {} };
    }
    current = current.children[part];
    if (current.type !== "directory") return false;
  }
  return true;
};

export function FileBrowserProvider({ children, testMode = false }) {
  const serviceUri = "luna://io.webosfilebrowser.service";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [pathHistory, setPathHistory] = useState(["/"]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const callService = useCallback(
    (method, parameters) => {
      if (testMode) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            try {
              switch (method) {
                case "listFiles": {
                  const files = getMockDirectory(parameters.path);
                  if (files) {
                    resolve({ success: true, files });
                  } else {
                    reject({
                      code: "FILE_NOT_FOUND",
                      message: "Directory not found",
                    });
                  }
                  break;
                }
                case "readFile": {
                  const file = getMockFile(parameters.path);
                  if (file) {
                    resolve({ success: true, content: file.content });
                  } else {
                    reject({
                      code: "FILE_NOT_FOUND",
                      message: "File not found",
                    });
                  }
                  break;
                }
                case "writeFile": {
                  const success = setMockFile(
                    parameters.path,
                    parameters.content
                  );
                  if (success) {
                    resolve({ success: true });
                  } else {
                    reject({
                      code: "PERMISSION_DENIED",
                      message: "Cannot write to this location",
                    });
                  }
                  break;
                }
                case "deleteFile": {
                  const success = deleteMockPath(parameters.path);
                  if (success) {
                    resolve({ success: true });
                  } else {
                    reject({
                      code: "FILE_NOT_FOUND",
                      message: "File or directory not found",
                    });
                  }
                  break;
                }
                case "createDirectory": {
                  const success = createMockDirectory(parameters.path);
                  if (success) {
                    resolve({ success: true });
                  } else {
                    reject({
                      code: "PERMISSION_DENIED",
                      message: "Cannot create directory at this location",
                    });
                  }
                  break;
                }
                case "renameFile": {
                  const file =
                    getMockFile(parameters.oldpath) ||
                    getMockDirectory(parameters.oldpath);
                  if (file) {
                    const parts = parameters.newpath.split("/");
                    const newName = parts.pop();
                    const parentPath = parts.join("/") || "/";
                    const parentDir = getMockDirectory(parentPath);
                    if (parentDir) {
                      parentDir.push({
                        name: newName,
                        type: file.type,
                        content: file.content,
                      });
                      deleteMockPath(parameters.oldpath);
                      resolve({ success: true });
                    } else {
                      reject({
                        code: "RENAME_FAILED",
                        message: "Parent directory not found",
                      });
                    }
                  } else {
                    reject({
                      code: "FILE_NOT_FOUND",
                      message: "File or directory not found",
                    });
                  }
                  break;
                }
                default:
                  reject({
                    code: "UNKNOWN_ERROR",
                    message: "Method not implemented",
                  });
              }
            } catch (err) {
              reject({ code: "UNKNOWN_ERROR", message: err.message });
            }
          }, 100);
        });
      }

      return new Promise((resolve, reject) => {
        new LS2Request().send({
          service: serviceUri,
          method: method,
          parameters: parameters,
          onSuccess: (res) => {
            if (res.success) {
              resolve(res);
            } else {
              reject(res.error);
            }
          },
          onFailure: (err) => {
            reject({
              code: "SERVICE_CALL_ERROR",
              message: err.errorText,
            });
          },
        });
      });
    },
    [testMode]
  );

  const login = useCallback(
    (username, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const matchedUser = users.find(
            (user) => user.username === username && user.password === password
          );
          if (matchedUser) {
            setIsAuthenticated(true);
            setUser(matchedUser);
            resolve({ success: true, user: matchedUser });
          } else {
            reject({ success: false, message: "Invalid credentials" });
          }
        }, 500);
      });
    },
    [users]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const signup = useCallback(
    (username, password) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (
            users.some((existingUser) => existingUser.username === username)
          ) {
            reject({ success: false, message: "Username already exists" });
          } else {
            const newUser = { username, password };
            setUsers((prevUsers) => {
              const updatedUsers = [...prevUsers, newUser];
              console.log("Updated users list:", updatedUsers); // Debugging log
              return updatedUsers;
            });
            resolve({ success: true, user: newUser });
          }
        }, 500);
      });
    },
    [users]
  );
  const renameFile = useCallback((oldpath, newpath) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const parts = oldpath.split("/").filter((part) => part !== "");
        const newParts = newpath.split("/").filter((part) => part !== "");

        let current = mockFileSystem["/"];
        for (const part of parts.slice(0, -1)) {
          if (!current.children || !current.children[part]) {
            reject({ message: "Path not found" });
            return;
          }
          current = current.children[part];
        }

        const oldName = parts[parts.length - 1];
        const targetItem = current.children?.[oldName];
        if (!targetItem) {
          reject({ message: "File or directory not found" });
          return;
        }

        // Remove the old name
        delete current.children[oldName];

        // Add with new name
        const newParentPath = newParts.slice(0, -1);
        let newParent = mockFileSystem["/"];
        for (const part of newParentPath) {
          if (!newParent.children[part]) {
            newParent.children[part] = { type: "directory", children: {} };
          }
          newParent = newParent.children[part];
        }

        const newName = newParts[newParts.length - 1];
        newParent.children[newName] = targetItem;

        resolve({ success: true });
      }, 100);
    });
  }, []);

  const navigateTo = useCallback(
    (path) => {
      setCurrentPath(path);
      setPathHistory((prev) => [...prev.slice(0, currentIndex + 1), path]);
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex]
  );

  const navigateBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCurrentPath(pathHistory[currentIndex - 1]);
    }
  }, [currentIndex, pathHistory]);

  const navigateForward = useCallback(() => {
    if (currentIndex < pathHistory.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentPath(pathHistory[currentIndex + 1]);
    }
  }, [currentIndex, pathHistory]);

  const navigateUp = useCallback(() => {
    if (currentPath === "/") return;
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    navigateTo(parentPath);
  }, [currentPath, navigateTo]);

  const listFiles = useCallback(
    (path = currentPath) => {
      return callService("listFiles", { path });
    },
    [callService, currentPath]
  );

  const readFile = useCallback(
    (path) => {
      return callService("readFile", { path });
    },
    [callService]
  );

  const writeFile = useCallback(
    (path, content) => {
      return callService("writeFile", { path, content });
    },
    [callService]
  );

  const deleteFile = useCallback(
    (path) => {
      return callService("deleteFile", { path });
    },
    [callService]
  );

  const createDirectory = useCallback(
    (path) => {
      return callService("createDirectory", { path });
    },
    [callService]
  );

  const value = {
    currentPath,
    navigateTo,
    navigateBack,
    navigateForward,
    navigateUp,
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < pathHistory.length - 1,
    listFiles,
    readFile,
    writeFile,
    deleteFile,
    createDirectory,
    renameFile,
    login,
    logout,
    signup,
    isAuthenticated,
    users,
    isTestMode: testMode,
  };

  return (
    <FileBrowserContext.Provider value={value}>
      {children}
    </FileBrowserContext.Provider>
  );
}

export function useFileBrowser() {
  const context = useContext(FileBrowserContext);
  if (!context) {
    throw new Error("useFileBrowser must be used within a FileBrowserProvider");
  }
  return context;
}
