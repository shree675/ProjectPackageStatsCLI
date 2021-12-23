# ProjectPackageStatsCLI
>pkgcl \<command\> [options]

## About
This is a basic CLI tool that contains two commands that help list out all the dependencies installed in the project and check the status of package.json file.

## Commands and Uses
1. ***checkdeps***
```
$ pkgcl checkdeps -h
```
Checks all the dependencies installed in the project tree, including the dependencies installed in inner folders inside the project directory.
```
$ pkgcl checkdeps
```
It lists the dependencies found and notifies if a package is not in its latest version. This helps in realizing and removing unused or unwanted dependencies to reduce the size of the project.

2. ***pjson***
```
$ pkgcl pjson -h
```
Checks the outermost package.json file defined and mentions its status.
```
$ pkgcl pjson
```
It checks all the important fields and lists them. It notifies if a field is missing or incomplete. This helps in ensuring that the package.json is well refined before the release of the product.

## Screenshots

<img src="https://user-images.githubusercontent.com/58718144/147261580-21504659-83de-4683-ab61-2067e48cffba.png" width="650" />

<img src="https://user-images.githubusercontent.com/58718144/147261643-0d4f3cfc-dfed-40a1-a463-a212ef6a21f5.png" width="650" />

## Steps To Run Locally
* Clone this repository on your local machine.
* Open a terminal in the root directory.
* Run the following:
```
$ npm install
```
* To enable ```pkgcl``` on your local machine, run in the root directory the following:
```
$ npm i -g
```
* The command can now be used anywhere.

## Contribute
This project currently supports only two basic commands. It can be extended further to include more commands or improve the functionality of the existing commands.

Ideas and PRs are welcome.
