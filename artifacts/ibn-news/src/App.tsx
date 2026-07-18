import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import Category from "@/pages/Category";
import SearchPage from "@/pages/Search";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPosts from "@/pages/AdminPosts";
import AdminPostForm from "@/pages/AdminPostForm";
import SignUp from "@/pages/SignUp";
import AdminEditors from "@/pages/AdminEditors";
import AdminEngagement from "@/pages/AdminEngagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

import AuthorPage from "@/pages/AuthorPage";
import AdminComments from "@/pages/AdminComments";
import AdminNewsletter from "@/pages/AdminNewsletter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/news/:id" component={ArticleDetail} />
      <Route path="/category/:name" component={Category} />
      <Route path="/search" component={SearchPage} />
      <Route path="/author/:name" component={AuthorPage} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/posts" component={AdminPosts} />
      <Route path="/admin/posts/new" component={AdminPostForm} />
      <Route path="/admin/posts/:id/edit" component={AdminPostForm} />
      <Route path="/admin/editors" component={AdminEditors} />
      <Route path="/admin/engagement" component={AdminEngagement} />
      <Route path="/admin/comments" component={AdminComments} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    if (!document.querySelector('link[type="application/rss+xml"]')) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.type = 'application/rss+xml';
      link.href = '/api/rss';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
