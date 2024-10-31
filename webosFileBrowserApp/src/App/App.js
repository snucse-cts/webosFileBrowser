import kind from '@enact/core/kind';
import './attachErrorHandler';

const App = kind({
	name: 'App',
	render: function (props) {
		return (
			<div className="text-3xl font-bold text-sky-500">
				Hello Web Os File Browser!
			</div>
		);
	}
});

export default App;
export {App};
