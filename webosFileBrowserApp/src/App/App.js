import kind from '@enact/core/kind';
import './attachErrorHandler';

import { FileBrowserProvider } from '../contexts/FileBrowserContext';
import FileBrowser from '../components/FileBrowser/FileBrowser';

const App = kind({
	name: 'App',
	render: function (props) {
		return (
			<FileBrowserProvider testMode={true}>
				<div className="min-h-screen bg-white">
					<header className="bg-sky-500 text-white p-4">
						<h1 className="text-2xl font-bold">
							WebOS File Browser
						</h1>
					</header>
					<main className="p-4">
						<FileBrowser />
					</main>
				</div>
			</FileBrowserProvider>
		);
	}
});

export default App;
export {App};
