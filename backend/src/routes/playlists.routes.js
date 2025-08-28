import express from "express"
import { authmiddleware } from "../middleware/auth.middleware.js"

import { addProblemToPlaylists, createPlaylist, deletePlaylist, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controllers/playlist.controller.js"

const playlistRoutes=express.Router()

playlistRoutes.get('/',authmiddleware,getAllListDetails)

playlistRoutes.get('/:playlistId',authmiddleware,getPlayListDetails)

playlistRoutes.post('/create-playlist',authmiddleware,createPlaylist)

playlistRoutes.post("/:playlistId/add-problem",authmiddleware,addProblemToPlaylists)

playlistRoutes.delete("/:playlistId",authmiddleware,deletePlaylist)

playlistRoutes.delete("/:playlistId/remove-problem",authmiddleware,removeProblemFromPlaylist)


export default playlistRoutes