let limit = 10; // Hur många inlägg vi hämtar åt gången
let skip = 0; // Hur många vi ska hoppa över (pagination)
let loading = false; // Förhindra flera anrop samtidigt

async function fetchPosts() {
    if (loading) return;
    loading = true;

    try {
        const response = await fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${skip}`);
        if (!response.ok) throw new Error("Failed to load posts");
        
        const data = await response.json();
        if (!data.posts || data.posts.length === 0) throw new Error("No posts found");

        const postsWithDetails = await Promise.all(data.posts.map(async post => {
            try {
                const userResponse = await fetch(`https://dummyjson.com/users/${post.userId}`);
                if (!userResponse.ok) throw new Error("Failed to load user");
                const userData = await userResponse.json();

                const commentsResponse = await fetch(`https://dummyjson.com/comments/post/${post.id}`);
                if (!commentsResponse.ok) throw new Error("Failed to load comments");
                const commentsData = await commentsResponse.json();

                return { 
                    ...post, 
                    username: userData.username || "Unknown", 
                    comments: commentsData.comments || [] 
                };
            } catch (error) {
                console.error(`Error fetching details for post ${post.id}:`, error);
                return { ...post, username: "Unknown", comments: [] }; // Sätt defaultvärden vid fel
            }
        }));

        displayPosts(postsWithDetails);
        skip += limit;
    } catch (error) {
        console.error("Error fetching posts:", error);
        document.getElementById("posts-container").innerHTML = `<p class="error-message">${error.message}</p>`;
    } finally {
        loading = false;
    }
}






function displayPosts(posts) {
    const postsContainer = document.getElementById("posts-container");

    // Om inga inlägg hittas, visa ett meddelande
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = "<p class='error-message'>No posts available.</p>";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("article");
        postElement.classList.add("post");

        const commentsSection = document.createElement("div");
        commentsSection.classList.add("comments-section");

        if (post.comments && post.comments.length > 0) {
            commentsSection.innerHTML = `<h3>Comments:</h3>`;
            post.comments.forEach(comment => {
                const commentElement = document.createElement("p");
                commentElement.classList.add("comment");
                commentElement.innerHTML = `<strong>${comment.user?.username || "Unknown"}:</strong> ${comment.body}`;
                commentsSection.appendChild(commentElement);
            });
        } else {
            commentsSection.innerHTML = `<p class="no-comments">No comments available.</p>`;
        }

        postElement.innerHTML = `
            <h2>${post.title || "Untitled Post"}</h2>
            <p class="post-body">${post.body || "No content available."}</p>
            <p class="post-meta">By: <a href="user.html?id=${post.userId}">${post.username || "Unknown"}</a></p>
            <p class="post-meta">Tags: ${post.tags?.join(", ") || "No tags"}</p>
            <p class="post-meta">👍 Likes: ${post.reactions?.likes || 0} | 👎 Dislikes: ${post.reactions?.dislikes || 0}</p>
        `;

        postElement.appendChild(commentsSection);
        postsContainer.appendChild(postElement);
    });
}




fetchPosts();


window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchPosts(); // Hämta fler inlägg när användaren når botten
    }
});

