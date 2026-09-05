import { Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import { RequireAuth, RequireAdmin } from "./components/auth/RouteGuards.jsx";
import { PageLoader } from "./components/ui/Loading.jsx";
import Toaster from "./components/ui/Toaster.jsx";
import { useAuthStore } from "./stores/authStore.js";
import { useNotificationSocket } from "./hooks/useNotificationSocket.js";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const Discover = lazy(() => import("./pages/Discover.jsx"));
const CitiesList = lazy(() => import("./pages/CitiesList.jsx"));
const CityDetail = lazy(() => import("./pages/CityDetail.jsx"));
const NeighborhoodDetail = lazy(() => import("./pages/NeighborhoodDetail.jsx"));
const PlaceDetail = lazy(() => import("./pages/PlaceDetail.jsx"));
const MapExplorer = lazy(() => import("./pages/MapExplorer.jsx"));
const FoodList = lazy(() => import("./pages/FoodList.jsx"));
const FoodDetail = lazy(() => import("./pages/FoodDetail.jsx"));
const CultureList = lazy(() => import("./pages/CultureList.jsx"));
const CultureDetail = lazy(() => import("./pages/CultureDetail.jsx"));
const EventsList = lazy(() => import("./pages/EventsList.jsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.jsx"));
const LanguageHome = lazy(() => import("./pages/LanguageHome.jsx"));
const LanguageLessonPage = lazy(() => import("./pages/LanguageLessonPage.jsx"));
const AiAssistant = lazy(() => import("./pages/AiAssistant.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const SavedPlaces = lazy(() => import("./pages/SavedPlaces.jsx"));
const Collections = lazy(() => import("./pages/Collections.jsx"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminPlaces = lazy(() => import("./pages/admin/AdminPlaces.jsx"));
const AdminCities = lazy(() => import("./pages/admin/AdminCities.jsx"));
const AdminFood = lazy(() => import("./pages/admin/AdminFood.jsx"));
const AdminCulture = lazy(() => import("./pages/admin/AdminCulture.jsx"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents.jsx"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports.jsx"));

export default function App() {
  const token = useAuthStore((s) => s.token);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  useNotificationSocket();

  useEffect(() => {
    if (token) refreshMe().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/cities" element={<CitiesList />} />
            <Route path="/cities/:slug" element={<CityDetail />} />
            <Route path="/neighborhoods/:slug" element={<NeighborhoodDetail />} />
            <Route path="/places/:slug" element={<PlaceDetail />} />
            <Route path="/map" element={<MapExplorer />} />
            <Route path="/food" element={<FoodList />} />
            <Route path="/food/:slug" element={<FoodDetail />} />
            <Route path="/culture" element={<CultureList />} />
            <Route path="/culture/:slug" element={<CultureDetail />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/language" element={<LanguageHome />} />
            <Route path="/language/:slug" element={<LanguageLessonPage />} />
            <Route path="/community" element={<Community />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/u/:username" element={<Profile />} />
            <Route
              path="/assistant"
              element={
                <RequireAuth>
                  <AiAssistant />
                </RequireAuth>
              }
            />
            <Route
              path="/saved"
              element={
                <RequireAuth>
                  <SavedPlaces />
                </RequireAuth>
              }
            />
            <Route
              path="/collections"
              element={
                <RequireAuth>
                  <Collections />
                </RequireAuth>
              }
            />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route
              path="/notifications"
              element={
                <RequireAuth>
                  <Notifications />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/places" element={<AdminPlaces />} />
            <Route path="/admin/cities" element={<AdminCities />} />
            <Route path="/admin/food" element={<AdminFood />} />
            <Route path="/admin/culture" element={<AdminCulture />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
