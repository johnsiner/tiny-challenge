import SearchIcon from './icons/SearchIcon';
import { useDebounce } from './hooks/use-debounce';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import LoadingIcon from './icons/LoadingIcon';

type LoadingResultState = {
   state: 'Loading';
};

type SuccessResultState = {
   state: 'Success';
   data: {
      Search: {
         Title: string;
         Year: string;
         imdbID: string;
         Poster: string;
         Type: string;
      }[];
      Response: 'True' | 'False';
   };
};

type ErrorResultState = {
   state: 'Error';
   error: { message: string };
};

type ResultState = LoadingResultState | SuccessResultState | ErrorResultState;

function App() {
   const [searchString, setSearchString] = useState('');
   const [searchResult, setSearchResult] = useState<ResultState>();

   const debouncedValue = useDebounce<string>(searchString as string, 500);

   const handleSearchMovie = useCallback(async () => {
      if (debouncedValue) {
         try {
            setSearchResult({ state: 'Loading' });
            const omdbapiKey = import.meta.env.VITE_OMDB_API_KEY;
            const res = await axios.get(
               `http://www.omdbapi.com/?apikey=${omdbapiKey}&s=${debouncedValue}`
            );
            setSearchResult({ state: 'Success', data: res.data });
         } catch (error) {
            setSearchResult({
               state: 'Error',
               error: error as { message: string },
            });
            console.log(error);
         }
      }
   }, [debouncedValue]);

   const getTitle = (title: string) => {
      if (searchResult?.state === 'Success') {
         const parts = title.split(new RegExp(`(${searchString})`, 'gi'));
         return (
            <span>
               {parts.map((part, i) => (
                  <span
                     key={i}
                     className={
                        part.toLowerCase() === searchString.toLowerCase()
                           ? 'bg-yellow-200'
                           : ''
                     }
                  >
                     {part}
                  </span>
               ))}
            </span>
         );
      }
   };

   useEffect(() => {
      handleSearchMovie();
   }, [handleSearchMovie]);

   return (
      <div className="h-screen w-screen flex justify-center p-6">
         <div className="mt-[10%] bg-white drop-shadow-lg rounded-lg h-fit w-full md:w-[450px] overflow-hidden">
            <div className="relative">
               <label htmlFor="Search" className="sr-only">
                  Search
               </label>
               <input
                  type="text"
                  id="Search"
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                  placeholder="Search for movie with title"
                  className="w-full border-gray-200 py-2.5 px-4 sm:text-sm active:outline-none focus:outline-none border-b"
               />
               <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
                  <SearchIcon />
               </span>
            </div>
            <div className="h-[200px] mt-4 p-4 overflow-y-auto">
               {searchResult?.state === 'Loading' && (
                  <div className="flex justify-center mt-2">
                     <LoadingIcon />
                  </div>
               )}
               {searchResult?.state === 'Success' &&
                  (searchResult.data.Response === 'True' ? (
                     <div className="flex flex-col gap-5">
                        {searchResult.data.Search.map((item) => (
                           <div
                              key={item.imdbID}
                              className="flex items-center gap-3"
                           >
                              <img
                                 src={item.Poster}
                                 className="h-12 w-12 rounded-md drop-shadow"
                              />
                              <p>
                                 {getTitle(item.Title)}
                                 {' - '}
                                 <span className="text-sm text-gray-500">
                                    {item.Type}
                                 </span>
                              </p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-gray-500 text-center">
                        Movie not found
                     </p>
                  ))}
               {searchResult?.state === 'Error' && (
                  <p className="text-gray-500 text-center">
                     Something went wrong
                  </p>
               )}
            </div>
         </div>
      </div>
   );
}

export default App;
