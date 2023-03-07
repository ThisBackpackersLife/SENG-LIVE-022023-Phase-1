const pokeContainer = document.querySelector("#poke-container");
const pokeForm = document.querySelector("#poke-form");
const pokeFormContainer = document.querySelector("#poke-form-container");

const getPokemon = () => {
  fetch("http://localhost:3000/characters")
    .then((resp) => resp.json())
    .then((characters) => {
      characters.forEach(renderPokemon);
    });
};

getPokemon();

const createPokemon = (e) => {
  e.preventDefault();
  const name = document.querySelector("#name-input").value;
  const img = document.querySelector("#img-input").value;

  let newChar = {
    name,
    img,
    likes: 0,
  };

  const configObj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(newChar),
  };

  fetch("http://localhost:3000/characters", configObj);
  renderPokemon(newChar);
  pokeForm.reset();
};

pokeForm.addEventListener("submit", createPokemon);

const increaseLikes = (e, char, likeNum) => {
  e.stopPropagation();
  ++char.likes;
  fetch(`http://localhost:3000/characters/${char.id}`, {
    method: 'PATCH',
    headers: {
      'content-Type': 'application/json'
    },
    body: JSON.stringify({ likes: char.likes})
  })
  .then((response) => response.json())
  .then((charData) => likeNum.textContent = charData.likes)
  // optimistic:
  // likeNum.textContent = char.likes;
};

const renderComment = (comment, commentsDiv) => {
  let li = document.createElement("li");
  li.textContent = comment.content;
  commentsDiv.append(li);
  return li;
};

const commentsForm = () => {
  let form = document.createElement("form");
  form.id = "comment-form";

  // attach an event listener to the #comment-form
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let content = document.querySelector("#comment-input").value;

    let characterId = parseInt(
      document.querySelector("#poke-show-card").dataset.id
    );

    let newComment = {
      content: content,
      characterId: characterId,
    };

    // making a POST request
    fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(newComment),
    })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (comment) {
        const commentsDiv = document.querySelector(
          `#comment-card-${characterId}`
        );
        renderComment(comment, commentsDiv);
      });
  });

  let commentInput = document.createElement("input");
  commentInput.type = "text";
  commentInput.id = "comment-input";

  let label = document.createElement("label");
  label.className = "form-label";
  label.textContent = "Leave a comment: ";
  form.appendChild(label);

  let submit = document.createElement("input");
  submit.type = "submit";
  submit.id = "submit";

  form.append(commentInput, submit);

  return form;
};

const showCharacter = (character) => {
  fetch(`http://localhost:3000/characters/${character.id}`)
    .then((resp) => resp.json())
    .then((character) => {
      const pokeCard = renderPokemon(character);
      pokeCard.id = "poke-show-card";
      pokeCard.dataset.id = character.id;
      loadComments(pokeCard, character);
      pokeContainer.replaceChildren(pokeCard);
      pokeFormContainer.replaceChildren(commentsForm());
      pokeContainer.replaceChildren(pokeCard);
    });
};

const renderPokemon = (char) => {
  const pokeCard = document.createElement("div");
  pokeCard.id = `poke-${char.id}`;
  pokeCard.className = "poke-card";

  pokeCard.addEventListener("click", () => showCharacter(char));

  const pokeImg = document.createElement("img");
  pokeImg.src = char.img;
  pokeImg.alt = `${char.name} image`;

  const pokeName = document.createElement("h3");
  pokeName.textContent = char.name;

  const pokeLikes = document.createElement("h3");
  pokeLikes.textContent = "Likes: ";

  const likeNum = document.createElement("h3");
  likeNum.className = "likes-num";
  likeNum.textContent = char.likes;

  const likesBttn = document.createElement("button");
  likesBttn.className = "like-bttn";
  likesBttn.textContent = "♥";
  likesBttn.addEventListener("click", (e) => increaseLikes(e, char, likeNum));

  const deleteBttn = document.createElement("button");
  deleteBttn.className = "delete-bttn";
  deleteBttn.textContent = "delete";
  deleteBttn.addEventListener("click", (e) => {
    e.stopPropagation();
    fetch(`http://localhost:3000/characters/${char.id}`, {
      method: 'DELETE'
    })
    .then((response) => response.json())
    .then(() => pokeCard.remove())
  
  });

  pokeCard.append(pokeImg, pokeName, pokeLikes, likeNum, likesBttn, deleteBttn);
  pokeContainer.appendChild(pokeCard);
  return pokeCard;
};

const loadComments = (pokeCard, character) => {
  const commentsDiv = document.createElement("div");
  commentsDiv.id = `comment-card-${character.id}`;
  const h4 = document.createElement("h4");
  h4.textContent = `${character.comments.length} comments:`;
  commentsDiv.append(h4);
  pokeCard.append(commentsDiv);
  character.comments.forEach((comment) => renderComment(comment, commentsDiv));
};
