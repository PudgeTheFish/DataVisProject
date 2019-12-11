# DataVisProject
This project visualizes trends in social media app use accross different demographics and behaviors. We pulled data from the Pew Core Trends survey from the years 2018 and 2019.

The functions.js is the main file containing the javascript code and rendering of the webpage. There is also an index.css file for some additional styling. Data_2018.json and Data_2019.json contain the data in json format.

The data being rendered was designed to be as modular as possible to allow for easy addition of multiple filters. There are several calls to helper functions with parameters being passed, such as createSocialArr(). Two similar but distinct functions were created to filter the social media data and calculate the percentages for each level of frequency of social media use. createSocialArr() calculates the percentage of the total number of participants in that category, regardless of if they use that social media app or not. createSocialArr2() only calculated the percentage out of those who use the app, so that the total frequencies add up to 100%.

State was managed by the variables currSocials and currentFilter. currSocials kept an array of the social media apps selected, and currentFilter stores the current filter selected. There are maps at the top of the file to map filters to their corresponding filter map and socials to corresponding attributes such as color and their original name in the survey.
