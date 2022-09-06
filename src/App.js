import './App.css';
import Header from './Header';
import Footer from './Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="App-content">
        <h1>하이요~</h1>
        <p>
          <a className="App-link" href="https://github.com/bjtj" target="_blank" rel="noreferrer">Github</a>
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default App;
