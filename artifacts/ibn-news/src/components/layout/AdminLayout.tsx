import { useLocation, Link } from "wouter";
import { useGetMe, useLogout, useGetPendingCommentsCount } from "@workspace/api-client-react";
import { useEffect } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  LogOut, 
  Settings, 
  Newspaper, 
  Users, 
  BarChart2,
  MessageSquare,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe();
  const logoutMutation = useLogout();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation("/login");
    }
  }, [isLoading, isError, user, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Logged out successfully" });
        setLocation("/");
      }
    });
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  const { data: pendingComments } = useGetPendingCommentsCount();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Manage Posts", href: "/admin/posts", icon: <FileText className="h-5 w-5" /> },
    { name: "New Post", href: "/admin/posts/new", icon: <PlusCircle className="h-5 w-5" /> },
  ];

  if (user?.role === "admin") {
    navItems.push(
      { name: "Team", href: "/admin/editors", icon: <Users className="h-5 w-5" /> },
      { name: "Engagement", href: "/admin/engagement", icon: <BarChart2 className="h-5 w-5" /> },
      { 
        name: "Comments", 
        href: "/admin/comments", 
        icon: <MessageSquare className="h-5 w-5" />,
        badge: pendingComments?.count || 0
      },
      { name: "Newsletter", href: "/admin/newsletter", icon: <Mail className="h-5 w-5" /> }
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-sm">
                <span className="font-serif text-xl font-bold">IBN</span>
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Newsroom</h2>
                <p className="text-xs text-slate-400">Editorial Dashboard</p>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{user.username}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium ${
                location === item.href 
                  ? "bg-primary text-white" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}>
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center text-[10px] px-1">
                    {item.badge}
                  </Badge>
                )}
              </span>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link href="/">
              <span className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
                <Newspaper className="h-5 w-5" />
                View Site
              </span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 px-3"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-3 h-5 w-5" />
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="bg-primary text-white w-8 h-8 flex items-center justify-center rounded-sm">
                <span className="font-serif font-bold">IBN</span>
              </div>
              <span className="font-bold">Newsroom</span>
           </div>
           <Button variant="ghost" size="icon" onClick={handleLogout}>
             <LogOut className="h-5 w-5" />
           </Button>
        </header>
        
        {/* Mobile Nav */}
        <div className="md:hidden bg-slate-800 text-white flex overflow-x-auto whitespace-nowrap">
           {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer ${
                location === item.href 
                  ? "border-b-2 border-primary text-white" 
                  : "text-slate-400"
              }`}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
        
        <div className="p-6 md:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
