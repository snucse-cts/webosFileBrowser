import React, { createContext, useContext, useCallback, useState } from 'react';
import LS2Request from '@enact/webos/LS2Request';

const FileBrowserContext = createContext();

const mockFileSystem = {
    '/': {
        type: 'directory',
        children: {
            'home': { type: 'directory', children: {} },
            'media': { type: 'directory', children: {
                'videos': { type: 'directory', children: {} },
                'music': { type: 'directory', children: {} }
            }},
            'test.txt': { type: 'file', content: 'Hello World!' },
            'sample.json': { type: 'file', content: '{"test": "data"}' }
        }
    }
};

const mockUsers = {
    users: {
        'test@example.com': {
            password: 'test123',
            token: 'mock-token-123'
        }
    },
    tokens: {
        'mock-token-123': 'test@example.com'
    }
};

const getMockDirectory = (path) => {
    const parts = path.split('/').filter(part => part !== '');
    let current = mockFileSystem['/'];
    for (const part of parts) {
        if (current.children && current.children[part]) {
            current = current.children[part];
        } else {
            return null;
        }
    }
    if (current.type !== 'directory') return null;
    return Object.entries(current.children).map(([name, item]) => ({
        name,
        type: item.type,
        size: item.type === 'file' ? item.content.length : undefined
    }));
};

const getMockFile = (path) => {
    const parts = path.split('/').filter(part => part !== '');
    let current = mockFileSystem['/'];
    for (const part of parts.slice(0, -1)) {
        if (current.children && current.children[part]) {
            current = current.children[part];
        } else {
            return null;
        }
    }
    const fileName = parts[parts.length - 1];
    const file = current.children?.[fileName];
    return file && file.type === 'file' ? file : null;
};

const setMockFile = (path, content) => {
    const parts = path.split('/').filter(part => part !== '');
    let current = mockFileSystem['/'];
    for (const part of parts.slice(0, -1)) {
        if (!current.children[part]) {
            current.children[part] = { type: 'directory', children: {} };
        }
        current = current.children[part];
        if (current.type !== 'directory') return false;
    }
    const fileName = parts[parts.length - 1];
    current.children[fileName] = { type: 'file', content };
    return true;
};

const deleteMockPath = (path) => {
    const parts = path.split('/').filter(part => part !== '');
    let current = mockFileSystem['/'];
    for (const part of parts.slice(0, -1)) {
        if (!current.children[part]) return false;
        current = current.children[part];
        if (current.type !== 'directory') return false;
    }
    const targetName = parts[parts.length - 1];
    if (!current.children[targetName]) return false;
    delete current.children[targetName];
    return true;
};

const createMockDirectory = (path) => {
    const parts = path.split('/').filter(part => part !== '');
    let current = mockFileSystem['/'];
    for (const part of parts) {
        if (!current.children[part]) {
            current.children[part] = { type: 'directory', children: {} };
        }
        current = current.children[part];
        if (current.type !== 'directory') return false;
    }
    return true;
};

export function FileBrowserProvider({ children, testMode = false }) {
    const serviceUri = 'luna://io.webosfilebrowser.service';
    const [currentPath, setCurrentPath] = useState('/');
    const [pathHistory, setPathHistory] = useState(['/']);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const callService = useCallback((method, parameters) => {
        if (testMode) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        switch (method) {
                            case 'listFiles': {
                                const files = getMockDirectory(parameters.path);
                                if (files) {
                                    resolve({ success: true, files });
                                } else {
                                    reject({ code: 'FILE_NOT_FOUND', message: 'Directory not found' });
                                }
                                break;
                            }
                            case 'readFile': {
                                const file = getMockFile(parameters.path);
                                if (file) {
                                    resolve({ success: true, content: file.content });
                                } else {
                                    reject({ code: 'FILE_NOT_FOUND', message: 'File not found' });
                                }
                                break;
                            }
                            case 'writeFile': {
                                const success = setMockFile(parameters.path, parameters.content);
                                if (success) {
                                    resolve({ success: true });
                                } else {
                                    reject({
                                        code: 'PERMISSION_DENIED',
                                        message: 'Cannot write to this location'
                                    });
                                }
                                break;
                            }
                            case 'deleteFile': {
                                const success = deleteMockPath(parameters.path);
                                if (success) {
                                    resolve({ success: true });
                                } else {
                                    reject({
                                        code: 'FILE_NOT_FOUND',
                                        message: 'File or directory not found'
                                    });
                                }
                                break;
                            }
                            case 'createDirectory': {
                                const success = createMockDirectory(parameters.path);
                                if (success) {
                                    resolve({ success: true });
                                } else {
                                    reject({
                                        code: 'PERMISSION_DENIED',
                                        message: 'Cannot create directory at this location'
                                    });
                                }
                                break;
                            }
                            case 'renameFile': {
                                const oldParts = parameters.oldpath.split('/').filter(Boolean);
                                const newParts = parameters.newpath.split('/').filter(Boolean);
                                
                                let current = mockFileSystem['/'];
                                for (const part of oldParts.slice(0, -1)) {
                                    if (!current.children[part]) return reject({
                                        success: false,
                                        error: {
                                            code: 'FILE_NOT_FOUND',
                                            message: 'Source path not found'
                                        }
                                    });
                                    current = current.children[part];
                                }
                                
                                const oldName = oldParts[oldParts.length - 1];
                                const item = current.children[oldName];
                                if (!item) {
                                    return reject({
                                        success: false,
                                        error: {
                                            code: 'FILE_NOT_FOUND',
                                            message: 'Source item not found'
                                        }
                                    });
                                }
                                current = mockFileSystem['/'];
                                for (const part of newParts.slice(0, -1)) {
                                    if (!current.children[part]) {
                                        return reject({
                                            success: false,
                                            error: {
                                                code: 'INVALID_PATH',
                                                message: 'Destination path not found'
                                            }
                                        });
                                    }
                                    current = current.children[part];
                                }

                                const newName = newParts[newParts.length - 1];
                                if (current.children[newName]) {
                                    return reject({
                                        success: false,
                                        error: {
                                            code: 'PERMISSION_DENIED',
                                            message: 'Destination already exists'
                                        }
                                    });
                                }

                                let source = mockFileSystem['/'];
                                for (const part of oldParts.slice(0, -1)) {
                                    source = source.children[part];
                                }

                                let target = mockFileSystem['/'];
                                for (const part of newParts.slice(0, -1)) {
                                    target = target.children[part];
                                }

                                target.children[newName] = source.children[oldName];
                                delete source.children[oldName];

                                resolve({ success: true });
                                break;
                            }
                            case 'signup': {
                                const { username, password } = parameters;
                                if (mockUsers.users[username]) {
                                    reject({
                                        success: false,
                                        error: {
                                            code: 'USER_EXISTS',
                                            message: 'User already exists'
                                        }
                                    });
                                } else {
                                    const token = `mock-token-${Date.now()}`;
                                    mockUsers.users[username] = { password, token };
                                    mockUsers.tokens[token] = username;
                                    resolve({ success: true });
                                }
                                break;
                            }
                            case 'login': {
                                const { username, password } = parameters;
                                const user = mockUsers.users[username];
                                if (!user || user.password !== password) {
                                    reject({
                                        success: false,
                                        error: {
                                            code: 'INVALID_CREDENTIALS',
                                            message: 'Invalid email or password'
                                        }
                                    });
                                } else {
                                    resolve({
                                        success: true,
                                        token: user.token,
                                        expiresIn: 3600
                                    });
                                }
                                break;
                            }
                            default:
                                reject({ code: 'UNKNOWN_ERROR', message: 'Method not implemented' });
                        }
                    } catch (err) {
                        reject({ code: 'UNKNOWN_ERROR', message: err.message });
                    }
                }, 100);
            });
        }

        return new Promise((resolve, reject) => {
            new LS2Request().send({
                service: serviceUri,
                method: method,
                parameters: { ...parameters, token },
                onSuccess: (res) => {
                    if (res.success) {
                        resolve(res);
                    } else {
                        reject(res.error);
                    }
                },
                onFailure: (err) => {
                    reject({
                        code: 'SERVICE_CALL_ERROR',
                        message: err.errorText
                    });
                }
            });
        });
    }, [testMode, token]);

    const navigateTo = useCallback((path) => {
        setCurrentPath(path);
        setPathHistory(prev => [...prev.slice(0, currentIndex + 1), path]);
        setCurrentIndex(prev => prev + 1);
    }, [currentIndex]);

    const navigateBack = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setCurrentPath(pathHistory[currentIndex - 1]);
        }
    }, [currentIndex, pathHistory]);

    const navigateForward = useCallback(() => {
        if (currentIndex < pathHistory.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setCurrentPath(pathHistory[currentIndex + 1]);
        }
    }, [currentIndex, pathHistory]);

    const navigateUp = useCallback(() => {
        if (currentPath === '/') return;
        const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
        navigateTo(parentPath);
    }, [currentPath, navigateTo]);

    const listFiles = useCallback((path = currentPath) => {
        return callService('listFiles', { path });
    }, [callService, currentPath]);

    const readFile = useCallback((path) => {
        return callService('readFile', { path });
    }, [callService]);

    const writeFile = useCallback((path, content) => {
        return callService('writeFile', { path, content });
    }, [callService]);

    const deleteFile = useCallback((path) => {
        return callService('deleteFile', { path });
    }, [callService]);

    const createDirectory = useCallback((path) => {
        return callService('createDirectory', { path });
    }, [callService]);

    const renameFile = useCallback((oldPath, newPath) => {
        return callService('renameFile', { oldpath: oldPath, newpath: newPath });
    }, [callService]);

    const signup = useCallback(async (username, password) => {
        return callService('signup', { username, password });
    }, [callService]);

    const login = useCallback(async (username, password) => {
        try {
            const response = await callService('login', { username, password });
            setToken(response.token);
            setIsAuthenticated(true);
            return response;
        } catch (err) {
            setToken(null);
            setIsAuthenticated(false);
            throw err;
        }
    }, [callService]);

    const logout = useCallback(() => {
        setToken(null);
        setIsAuthenticated(false);
        setCurrentPath('/');
        setPathHistory(['/']);
        setCurrentIndex(0);
    }, []);

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
        isTestMode: testMode,
        isAuthenticated,
        login,
        signup,
        logout
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
        throw new Error('useFileBrowser must be used within a FileBrowserProvider');
    }
    return context;
}