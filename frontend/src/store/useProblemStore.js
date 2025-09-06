import { create } from "zustand"
import { axiosInstance } from "../libs/axios"
import toast from "react-hot-toast"


export const useProblemStore = create((set) => ({

  problems: [],
  problem: null,
  solvedProblem: [],
  isProblemsLoading: false,
  isProblemLoading: false,


  getAllProblem: async () => {

    try {
      set({ isProblemLoading: true })

      const res = await axiosInstance("/problems/get-all-problems")
      set({ problems: res.data.problems })
    } catch (error) {
      console.error("error geting all the  problem", error)
      toast.error("error in the fetcing all the problem")
    }
    finally {
      set({ isProblemLoading: false })
    }
  },

  getProblemById: async (id) => {
    try {
      // Set loading state
      set({ isProblemLoading: true });

      // Fetch a single problem by ID
      const res = await axiosInstance.get(`/problems/get-problem/${id}`);

      // Update state with fetched problem
      set({ currentProblem: res.data.problem });
    } catch (error) {
      console.error(`Error getting problem with ID ${id}:`, error);
      toast.error("Error fetching the problem");
    } finally {
      // Reset loading state
      set({ isProblemLoading: false });
    }
  },


  getSolvedProblemByUser: async () => {
    try {
      // Set loading state
      set({ isProblemLoading: true });

      // Fetch solved problems for a specific user
      const res = await axiosInstance.get("/problems/get-solved-problem");

      // Update state with the solved problems
      set({ solvedProblems: res.data.problems });
    } catch (error) {
      console.error(`Error fetching solved problems`, error);
      toast.error("Error fetching solved problems");
    } finally {
      // Reset loading state
      set({ isProblemLoading: false });
    }
  },
}))

