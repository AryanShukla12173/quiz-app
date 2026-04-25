ALTER TABLE "user_problem_results"
ADD CONSTRAINT "user_problem_results_user_id_problem_id_unique"
UNIQUE ("user_id", "problem_id");
