import kind from '@enact/core/kind';
import './attachErrorHandler';

import { FileManager } from "@cubone/react-file-manager";

const files = [
	{
		name: "Documents",
		isDirectory: true, // Folder
		path: "/Documents", // Located in Root directory
		updatedAt: "2024-09-09T10:30:00Z", // Last updated time
	},
	{
		name: "Pictures",
		isDirectory: true,
		path: "/Pictures", // Located in Root directory as well
		updatedAt: "2024-09-09T11:00:00Z",
	},
	{
		name: "Pic.png",
		isDirectory: false, // File
		path: "/Pictures/Pic.png", // Located inside the "Pictures" folder
		updatedAt: "2024-09-08T16:45:00Z",
		size: 2048, // File size in bytes (example: 2 KB)
	},
]

const App = kind({
	name: 'App',
	render: function (props) {
		return (
			<div className="text-3xl font-bold text-sky-500">
				Hello Web Os File Browser!
				<FileManager files={files} />
			</div>
		);
	}
});

export default App;
export {App};
