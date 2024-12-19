import { useCallback, useState, useEffect } from 'react';
import { useFileBrowser } from '../../contexts/FileBrowserContext';

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {children}
        </div>
    </div>
);

const FileItem = ({ name, type, size, onSelect, onDelete, onRename }) => {
    const icon = type === 'directory' ? '📁' : '📄';
    
    return (
        <div className="flex items-center p-2 hover:bg-gray-100 group">
            <div
                className="flex-grow flex items-center cursor-pointer"
                onClick={() => onSelect(name, type)}
            >
                <span className="mr-2">{icon}</span>
                <span className="flex-grow">{name}</span>
                {type === 'file' && <span className="text-sm text-gray-500">{size} bytes</span>}
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRename(name, type);
                    }}
                    className="px-2 py-1 text-blue-500 hover:bg-blue-50 rounded"
                >
                    Rename
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(name, type);
                    }}
                    className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

const Spinner = () => (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-500 mb-4"></div>
            <div className="text-lg text-gray-600">Loading files...</div>
        </div>
    </div>
);

const sortFiles = (files) => {
    return [...files].sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
};

const FileBrowser = () => {
    const {
        currentPath,
        navigateTo,
        navigateUp,
        navigateBack,
        navigateForward,
        canGoBack,
        canGoForward,
        listFiles,
        readFile,
        writeFile,
        deleteFile,
        createDirectory,
        renameFile
    } = useFileBrowser();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateDirModal, setShowCreateDirModal] = useState(false);
    const [showCreateFileModal, setShowCreateFileModal] = useState(false);
    const [showFileContentModal, setShowFileContentModal] = useState(false);
    const [newDirName, setNewDirName] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [newFileContent, setNewFileContent] = useState('');
    const [selectedFileContent, setSelectedFileContent] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameItem, setRenameItem] = useState(null);
    const [newName, setNewName] = useState('');
    const [renameError, setRenameError] = useState('');
    const [createDirError, setCreateDirError] = useState('');
    const [createFileError, setCreateFileError] = useState('');

    const loadFiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await listFiles();
            setFiles(sortFiles(result.files));
        } catch (err) {
            setError(err.error?.message || 'Failed to load files');
        } finally {
            setLoading(false);
        }
    }, [listFiles]);

    useEffect(() => {
        loadFiles();
    }, [currentPath, loadFiles]);

    const handleSelect = useCallback(async (name, type) => {
        if (type === 'directory') {
            navigateTo(currentPath === '/' ? `/${name}` : `${currentPath}/${name}`);
        } else {
            try {
                const result = await readFile(`${currentPath === '/' ? '' : currentPath}/${name}`);
                setSelectedFileName(name);
                setSelectedFileContent(result.content);
                setEditedContent(result.content);
                setIsEditing(false);
                setShowFileContentModal(true);
            } catch (err) {
                setError(err.error?.message || 'Failed to read file');
            }
        }
    }, [currentPath, navigateTo, readFile]);

    const handleUpdateFile = async () => {
        try {
            const path = `${currentPath === '/' ? '' : currentPath}/${selectedFileName}`;
            await writeFile(path, editedContent);
            setSelectedFileContent(editedContent);
            setIsEditing(false);
            loadFiles();
        } catch (err) {
            setError(err.error?.message || 'Failed to update file');
        }
    };

    const handleCreateDirClick = () => {
        setCreateDirError('');
        setNewDirName('');
        setShowCreateDirModal(true);
    };

    const handleCreateFileClick = () => {
        setCreateFileError('');
        setNewFileName('');
        setNewFileContent('');
        setShowCreateFileModal(true);
    };

    const handleCreateDirectory = async () => {
        setCreateDirError('');

        if (!newDirName.trim()) {
            setCreateDirError('Folder name cannot be empty');
            return;
        }

        if (files.some(file => file.name === newDirName)) {
            setCreateDirError('An item with this name already exists');
            return;
        }

        try {
            const path = `${currentPath === '/' ? '' : currentPath}/${newDirName}`;
            await createDirectory(path);
            setShowCreateDirModal(false);
            setNewDirName('');
            loadFiles();
        } catch (err) {
            setError(err.error?.message || 'Failed to create directory');
        }
    };

    const handleCreateFile = async () => {
        setCreateFileError('');

        if (!newFileName.trim()) {
            setCreateFileError('File name cannot be empty');
            return;
        }

        if (files.some(file => file.name === newFileName)) {
            setCreateFileError('An item with this name already exists');
            return;
        }

        try {
            const path = `${currentPath === '/' ? '' : currentPath}/${newFileName}`;
            await writeFile(path, newFileContent);
            setShowCreateFileModal(false);
            setNewFileName('');
            setNewFileContent('');
            loadFiles();
        } catch (err) {
            setError(err.error?.message || 'Failed to create file');
        }
    };

    const handleDelete = async (name, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const path = `${currentPath === '/' ? '' : currentPath}/${name}`;
            await deleteFile(path);
            loadFiles();
        } catch (err) {
            setError(err.error?.message || 'Failed to delete item');
        }
    };

    const handleCloseFileModal = () => {
        setShowFileContentModal(false);
        setIsEditing(false);
        setEditedContent('');
        setSelectedFileName('');
        setSelectedFileContent('');
    };

    const handleRename = (name, type) => {
        setRenameItem({ name, type });
        setNewName(name);
        setRenameError('');
        setShowRenameModal(true);
    };

    const handleRenameSubmit = async () => {
        setRenameError('');

        if (!newName.trim()) {
            setRenameError('Name cannot be empty');
            return;
        }

        if (newName === renameItem.name) {
            setRenameError('New name is same as current name');
            return;
        }

        if (files.some(file => file.name === newName)) {
            setRenameError('An item with this name already exists');
            return;
        }

        try {
            const oldPath = `${currentPath === '/' ? '' : currentPath}/${renameItem.name}`;
            const newPath = `${currentPath === '/' ? '' : currentPath}/${newName}`;
            
            await renameFile(oldPath, newPath);
            
            setShowRenameModal(false);
            setRenameItem(null);
            setNewName('');
            setRenameError('');
            loadFiles();
        } catch (err) {
            setError(err.error?.message || 'Failed to rename item');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 relative">
            {loading && <Spinner />}

            <div className="flex items-center mb-4 space-x-2">
                <button
                    onClick={navigateBack}
                    disabled={!canGoBack || loading}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ←
                </button>
                <button
                    onClick={navigateForward}
                    disabled={!canGoForward || loading}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    →
                </button>
                <button
                    onClick={navigateUp}
                    disabled={currentPath === '/' || loading}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                    ↑
                </button>
                <div className="flex-grow px-3 py-1 bg-gray-100 rounded">
                    {currentPath}
                </div>
            </div>

            <div className="mb-4 space-x-2">
                <button
                    onClick={handleCreateDirClick}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    New Folder
                </button>
                <button
                    onClick={handleCreateFileClick}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    New File
                </button>
            </div>

            <div className="border rounded">
                {files.length === 0 ? (
                    <div className="p-4 text-gray-500">Empty directory</div>
                ) : (
                    files.map((file) => (
                        <FileItem
                            key={file.name}
                            {...file}
                            onSelect={loading ? undefined : handleSelect}
                            onDelete={loading ? undefined : handleDelete}
                            onRename={loading ? undefined : handleRename}
                        />
                    ))
                )}
            </div>

            {showCreateDirModal && (
                <Modal title="Create New Folder" onClose={() => setShowCreateDirModal(false)}>
                    <input
                        type="text"
                        value={newDirName}
                        onChange={(e) => setNewDirName(e.target.value)}
                        placeholder="Folder name"
                        className="w-full p-2 border rounded mb-2"
                    />
                    {createDirError && (
                        <div className="text-red-500 text-sm mb-4">{createDirError}</div>
                    )}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowCreateDirModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateDirectory}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Create
                        </button>
                    </div>
                </Modal>
            )}

            {showCreateFileModal && (
                <Modal title="Create New File" onClose={() => setShowCreateFileModal(false)}>
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="File name"
                        className="w-full p-2 border rounded mb-2"
                    />
                    {createFileError && (
                        <div className="text-red-500 text-sm mb-4">{createFileError}</div>
                    )}
                    <textarea
                        value={newFileContent}
                        onChange={(e) => setNewFileContent(e.target.value)}
                        placeholder="File content"
                        className="w-full p-2 border rounded mb-4 h-32"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowCreateFileModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateFile}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Create
                        </button>
                    </div>
                </Modal>
            )}

            {showFileContentModal && (
                <Modal title={`File: ${selectedFileName}`} onClose={handleCloseFileModal}>
                    {isEditing ? (
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full p-2 border rounded mb-4 h-64 font-mono"
                        />
                    ) : (
                        <div className="whitespace-pre-wrap border rounded p-4 mb-4 h-64 overflow-auto font-mono">
                            {selectedFileContent}
                        </div>
                    )}
                    <div className="flex justify-end space-x-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateFile}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleCloseFileModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </Modal>
            )}

            {showRenameModal && (
                <Modal
                    title={`Rename ${renameItem?.type === 'directory' ? 'Folder' : 'File'}`}
                    onClose={() => setShowRenameModal(false)}
                >
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New name"
                        className="w-full p-2 border rounded mb-2"
                    />
                    {renameError && (
                        <div className="text-red-500 text-sm mb-4">{renameError}</div>
                    )}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setShowRenameModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRenameSubmit}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Rename
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default FileBrowser;