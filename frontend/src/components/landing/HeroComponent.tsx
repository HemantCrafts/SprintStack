export const HeroComponent = () => {
    return (
      <section className="px-2 py-32 bg-background md:px-0">
          <div className="container items-center max-w-6xl px-8 mx-auto xl:px-5">
            <div className="flex flex-wrap items-center sm:-mx-3">
              <div className="w-full md:w-1/2 md:px-3">
                <div className="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                    <span className="block xl:inline">taskSync Helps Teams</span>{" "}
                    <span className="block text-indigo-600 dark:text-indigo-400 xl:inline">
                      Move Work Forwards.
                    </span>
                  </h1>
                  <p className="mx-auto text-base text-muted-foreground sm:max-w-md lg:text-xl md:max-w-3xl">
                    Collaborate, manage projects, and reach new productivity peaks.
                  </p>
                  <div className="relative flex flex-col sm:flex-row sm:space-x-4">
                    <a
                      href="#_"
                      className="flex items-center w-full px-6 py-3 mb-3 text-lg text-primary-foreground bg-indigo-600 dark:bg-indigo-500 rounded-md sm:mb-0 hover:bg-indigo-700 dark:hover:bg-indigo-400 sm:w-auto"
                    >
                      Try It Free
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 ml-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1={5} y1={12} x2={19} y2={12} />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </a>
                    <a
                      href="#_"
                      className="flex items-center px-6 py-3 text-muted-foreground bg-muted rounded-md hover:bg-accent hover:text-foreground"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    )
  }
