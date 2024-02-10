const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.getElementsByClassName("delete-button");

console.log("deleteBtns: ", deleteBtns);

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    console.log("newComment: ", newComment);
    newComment.className = "video__comment";
    newComment.dataset.id = id;
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    console.log("icon: ", icon);
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    console.log("span: ", span);
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment); //prepend: add to the top of the list
    span2.addEventListener("click", handleDelete);
    console.log("newComment: ", newComment);
};

// const removeComment = (id) => {
//     const videoComments = document.querySelector(".video__comments ul");
//     const comment = videoComments.querySelector(`li[data-id="${id}"]`);
//     if (comment) {
//         comment.remove();
//     }
// }

const handleDelete = async (e) => {
    const comment = e.target.parentElement;
    console.log("comment: ", comment);
    const videoId = videoContainer.dataset.id;
    console.log("videoId: ", videoId);
    const commentId = comment.dataset.id;
    console.log("commentId: ", commentId);
    const response = await fetch(
        `/api/videos/${videoId}/comment/${commentId}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    console.log("response.status: ", response.status);
    if (response.status === 201) {
        comment.remove();
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value.trim();
    const videoId = videoContainer.dataset.id;
    if (text === "") {
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }, //
        body: JSON.stringify({ text }),
    });

    if (response.status === 201) {
        textarea.value = "";
        // window.location.reload();
        console.log("create comment success )");
        const json = await response.json();
        console.log("json: ", json);
        addComment(text, json.newCommentId); // make temporary comment without refreshing
    }
};

if (form) {
    form.addEventListener("submit", handleSubmit);
}

Array.from(deleteBtns).forEach((btn) => {
    btn.addEventListener("click", handleDelete);
});
