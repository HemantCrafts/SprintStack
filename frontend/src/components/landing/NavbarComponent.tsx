import { Link } from "react-router-dom"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

export const NavbarComponent = () => {
    return (
      <section className="w-full px-8 text-foreground bg-background border-b border-border">
          <div className="container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl">
            <div className="relative flex flex-col md:flex-row">
              <a
                href="#_"
                className="flex items-center mb-5 font-medium lg:w-auto lg:items-center lg:justify-center md:mb-0"
              >
                <span className="mx-auto text-xl font-black leading-none select-none">
                  taskSync<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </span>
              </a>
              <nav className="flex flex-wrap items-center mb-5 text-base md:mb-0 md:pl-8 md:ml-8 md:border-l md:border-border">
                <a
                  href="#_"
                  className="mr-5 font-medium leading-6 text-muted-foreground hover:text-foreground"
                >
                  Home
                </a>
                <a
                  href="#_"
                  className="mr-5 font-medium leading-6 text-muted-foreground hover:text-foreground"
                >
                  Features
                </a>
              </nav>
            </div>
            <div className="inline-flex items-center ml-5 space-x-4 lg:justify-end">
              <ThemeToggle />
              <Link
                to="/login"
                className="text-base font-medium leading-6 text-muted-foreground whitespace-no-wrap transition duration-150 ease-in-out hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-primary-foreground whitespace-no-wrap bg-indigo-600 dark:bg-indigo-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-indigo-600"
              >
                Sign up
              </Link>
            </div>
          </div>
        </section>
    )
  }
