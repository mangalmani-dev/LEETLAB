import { db } from "../libs/db.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: "Playlist name is required" });
    }

    const playlist = await db.playlist.create({
      data: { name, description, userId },
    });

    res.status(200).json({
      success: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error in creating playlist", error);
    return res.status(500).json({ error: "Failed to create playlist" });
  }
};

// Get all playlists of the logged-in user
export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: { userId: req.user.id },
      include: {
        problemPlaylists: {       // ✅ fixed relation
          include: {
            problem: true
          }
        }
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.error("Playlists not fetched successfully", error);
    return res.status(500).json({ error: "Failed to fetch playlists" });
  }
};


export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const playlist = await db.playlist.findFirst({
      where: { id: playlistId, userId: req.user.id },
      include: {
        problemPlaylists: {    // ✅ use join table
          include: {
            problem: true      // include actual problem
          }
        }
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.error("Playlist not fetched successfully", error);
    return res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const addProblemToPlaylists = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemIds" });
    }

    const problemInPlaylist = await db.ProblemInPlayList.createMany({
      data: problemIds.map((problemId) => ({ playlistId, problemId })),
      skipDuplicates: true, // avoid duplicates
    });

    res.status(201).json({
      success: true,
      message: "Problems added to playlist successfully",
      problemInPlaylist,
    });
  } catch (error) {
    console.error("Failed to add problems to playlist", error);
    res.status(500).json({ error: "Failed to add problems to playlist" });
  }
};


// Delete a playlist
export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params; // fixed parameter name

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId, // use the correct variable
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error("Failed to delete playlist", error.message);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
};


// Remove multiple problems from a playlist
export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing problemIds",
      });
    }

    const deletedProblems = await db.ProblemInPlayList.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedProblems.count} problem(s) removed from playlist`,
    });
  } catch (error) {
    console.error("Failed to remove problems from playlist", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove problems from playlist",
    });
  }
};
