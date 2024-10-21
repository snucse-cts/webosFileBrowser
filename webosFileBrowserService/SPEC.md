### File Browser Service API Specification

#### Overview
The File Browser Service API allows the web application to interact with the file system through a backend service using the Luna Bus system. The service accepts JSON input and returns JSON output.

#### Endpoints

1. **List Files**
    - **Description**: Retrieve a list of files and directories in a specified directory. Note that root directory is `/` and It includes all files and directories in the system, including external storage or cloud storage.
    - **Method**: `luna://io.webosfilebrowser.service/listFiles`
    - **Input**:
      ```json
      {
        "path": "/path/to/directory"
      }
      ```
    - **Output**:
      ```json
      {
        "success": true,
        "files": [
          {
            "name": "file1.txt",
            "type": "file",
            "size": 1024
          },
          {
            "name": "subdir",
            "type": "directory"
          }
        ]
      }
      ```

2. **Read File**
    - **Description**: Read the contents of a specified file.
    - **Method**: `luna://io.webosfilebrowser.service/readFile`
    - **Input**:
      ```json
      {
        "path": "/path/to/file.txt"
      }
      ```
    - **Output**:
      ```json
      {
        "success": true,
        "content": "file content here"
      }
      ```

3. **Write File**
    - **Description**: Write content to a specified file.
    - **Method**: `luna://io.webosfilebrowser.service/writeFile`
    - **Input**:
      ```json
      {
        "path": "/path/to/file.txt",
        "content": "new file content"
      }
      ```
    - **Output**:
      ```json
      {
        "success": true
      }
      ```

4. **Delete File**
    - **Description**: Delete a specified file or directory.
    - **Method**: `luna://io.webosfilebrowser.service/deleteFile`
    - **Input**:
      ```json
      {
        "path": "/path/to/file_or_directory"
      }
      ```
    - **Output**:
      ```json
      {
        "success": true
      }
      ```

5. **Create Directory**
    - **Description**: Create a new directory.
    - **Method**: `luna://io.webosfilebrowser.service/createDirectory`
    - **Input**:
      ```json
      {
        "path": "/path/to/new_directory"
      }
      ```
    - **Output**:
      ```json
      {
        "success": true
      }
      ```

#### Error Handling
- **Error Response**:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Error message"
    }
  }
  ```

#### Error Codes
- `INVALID_PATH`: The specified path is invalid.
- `FILE_NOT_FOUND`: The specified file or directory does not exist.
- `PERMISSION_DENIED`: Insufficient permissions to perform the operation.
- `UNKNOWN_ERROR`: An unknown error occurred.
