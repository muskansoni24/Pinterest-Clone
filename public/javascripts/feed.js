function showBoards(postId) {
    // Display the modal for selecting a board
    const modal = document.getElementById(`board-modal-${postId}`);
    modal.style.display = 'flex';
  }
  
  // function saveToBoard(postId, boardId) {
  //   // Save the post to the selected board
  //   console.log(`Post ${postId} saved to board ${boardId}`);
  //   // Here you can make an AJAX request to save the post to the database
  
  //   // Close the modal
  //   closeBoardModal(postId);
  // }

  function saveToBoard(postId, boardId) {
    fetch('/save-to-board', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, boardId }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log(`Post ${postId} saved to board ${boardId}`);
        } else {
          console.error('Error saving post:', data.message);
        }
        closeBoardModal(postId);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        closeBoardModal(postId);
      });
  }
  
  function closeBoardModal(postId) {
    const modal = document.getElementById(`board-modal-${postId}`);
    modal.style.display = 'none';
  }
  