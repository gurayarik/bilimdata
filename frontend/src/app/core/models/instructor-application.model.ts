export interface InstructorApplication {
  id: string;
  user_id: string;
  title: string | null;
  bio: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
