import ChatWindow from "../components/ChatWindow";

function Home({ user }) {
  return (
    <div className="app">
      <ChatWindow user={user} />
    </div>
  );
}

export default Home;