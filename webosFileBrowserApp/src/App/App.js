import kind from '@enact/core/kind';
import './attachErrorHandler';

import { FileBrowserProvider, useFileBrowser } from '../contexts/FileBrowserContext';
import FileBrowser from '../components/FileBrowser/FileBrowser';
import Auth from '../components/Auth/Auth';

const App = kind({
	name: 'App',
	render: function (props) {
		return (
			<FileBrowserProvider testMode={false}>
				<AuthenticatedApp />
			</FileBrowserProvider>
		);
	}
});

const AuthenticatedApp = () => {
	const { isAuthenticated } = useFileBrowser();

	if (!isAuthenticated) {
		return <Auth />;
	}

	return (
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
	);
};

export default App;
export {App};
