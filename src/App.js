import { useState } from "react";

// Initial list of friends with their details
const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: 0, // balance represents money owed (Positive = they owe you; Negative = you owe them)
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 0,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

// Reusable Button component used for consistent styling and click behavior
function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

// Main App component controlling state and layout
export default function App() {
  // State for friends list, add friend form visibility, and selected friend
  const [friends, setFriends] = useState(initialFriends);
  // Controls whether the Add Friend form is shown
  const [showAddFriend, setShowAddFriend] = useState(false);
  // Tracks the currently selected friend (for splitting a bill)
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Toggles the visibility of the add friend form
  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }
  // Adds a new friend to the list
  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false); // Hide the form after adding
  }

  // Selects or deselects a friend (used before splitting the bill)
  function handleSelection(friend) {
    // If the same friend is clicked again, deselect
    setSelectedFriend((cur) => (cur?.id === friend.id ? null : friend)); // optional chaning '?' in cur?.id
    setShowAddFriend(false); // Always close the add friend form on selection
  }

  // Updates balances when splitting a bill
  function handleSplitBill(value) {
    // console.log(value);
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value }
          : friend
      )
    );
    // Reset selection after split
    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection}
        />
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}
        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add friend"}
        </Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}
// Renders a list of Friend components
function FriendsList({ friends, onSelection, selectedFriend }) {
  // const friends = initialFriends;
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          key={friend.id}
          selectedFriend={selectedFriend}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}

// Displays a single friend's info, balance, and selection button
function Friend({ friend, onSelection, selectedFriend }) {
  const isSelected = selectedFriend?.id === friend.id;
  // const isSelected = true;
  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {friend.balance < 0 && (
        <p className="red">
          {" "}
          You owe {friend.name} ${Math.abs(friend.balance)}{" "}
        </p>
      )}
      {friend.balance > 0 && (
        <p className="green">
          {" "}
          {friend.name} owes you ${Math.abs(friend.balance)}{" "}
        </p>
      )}
      {friend.balance === 0 && <p> {friend.name} and you are even </p>}

      <Button onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

// Form to add new friend
function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");
  function handleSubmit(e) {
    e.preventDefault();
    // basic validation
    if (!name || !image) return;

    const id = crypto.randomUUID();
    const newFriend = {
      name,
      image: `${image}?=${id}`, // Ensure unique image URL per friend
      balance: 0,
      id,
    };
    onAddFriend(newFriend); // Add friend to parent state
    // reset form to default name and image
    setName("");
    setImage("https://i.pravatar.cc/48");
  }
  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👫Name</label>
      <input
        type="'text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label> 🌄Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <Button> Add </Button>
    </form>
  );
}

// Form to split a bill with a selected friend
function FormSplitBill({ selectedFriend, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");
  const paidByFriend = bill ? bill - paidByUser : "";
  const [whoIsPaying, setWhoIsPaying] = useState("user");

  function handleSubmit(e) {
    e.preventDefault();
    if (!bill || !paidByUser) return; // Prevent empty submission
    // Determine who paid, and calculate how the balance should shift
    onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser);
  }
  return (
    // 🧾 Form container with submit handler
    <form className="form-split-bill" onSubmit={handleSubmit}>
      {/* 🧑‍🤝‍🧑 Dynamic title showing who you're splitting the bill with */}
      <h2>Split a bill with {selectedFriend.name}</h2>
      {/* 💰 Input for total bill amount */}
      <label>💰 Bill value </label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      />
      {/* 🧍‍♀️ Input for how much the user paid */}
      <label>🧍‍♀️ Your expense</label>
      <input
        type="text"
        value={paidByUser}
        // Prevent entering an amount greater than the total bill
        onChange={(e) =>
          setPaidByUser(
            Number(e.target.value) > bill ? paidByUser : Number(e.target.value) // casts string into int
          )
        }
      />
      {/* 👯 Read-only field showing the amount paid by the friend (derived value) */}
      <label>👫 {selectedFriend.name}'s expense </label>
      <input type="text" disabled value={paidByFriend} />

      <label> 🤑 Who is paying the bill</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)}
      >
        <option value="user"> you</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>
      {/* Button to submit the form and split the bill */}
      <Button> Split bill </Button>
    </form>
  );
}
