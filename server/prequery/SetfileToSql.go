package main

import (
    "os"
    "bufio"
    "bytes"
    "io"
    "fmt"
    "strings"
    "strconv"
)

// Read a whole file into the memory and store it as array of lines
func readLines(path string) (lines []string, err error) {
    var (
        file *os.File
        part []byte
        prefix bool
    )
    if file, err = os.Open(path); err != nil {
        return
    }
    defer file.Close()

    reader := bufio.NewReader(file)
    buffer := bytes.NewBuffer(make([]byte, 0))
    for {
        if part, prefix, err = reader.ReadLine(); err != nil {
            break
        }
        buffer.Write(part)
        if !prefix {
            lines = append(lines, buffer.String())
            buffer.Reset()
        }
    }
    if err == io.EOF {
        err = nil
    }
    return
}

func writeLines(lines []string, path string) (err error) {
    var (
        file *os.File
    )

    if file, err = os.Create(path); err != nil {
        return
    }
    defer file.Close()
    a, err := file.WriteString("DROP TABLE IF EXISTS \"temp\";\r\n" +
                               "CREATE TABLE [temp] (\r\n" +
                               "[id] integer PRIMARY KEY);\r\n");
    //file.Write([]byte(item)); 
    if a ==1 { }; //it doesn't like that variable isn't used...
    if err != nil {
        //fmt.Println("debug")
        fmt.Println(err)
        return
    }

    //writer := bufio.NewWriter(file)
    for _,item := range lines {
        if _, err := strconv.Atoi(strings.TrimSpace(item)); err == nil {
	    //fmt.Println(item)
            _, err := file.WriteString("INSERT OR REPLACE INTO \"temp\" VALUES (\"" + strings.TrimSpace(item) + "\");\r\n"); 
            //file.Write([]byte(item)); 
            if err != nil {
                //fmt.Println("debug")
                fmt.Println(err)
                break
            }
	}
    }
    /*content := strings.Join(lines, "\r\n")
    _, err = writer.WriteString(content)*/
    return
}

func main() {
    lines, err := readLines("5DS3.txt") //eventually will be replaced with whatever file(s) you want.
    if err != nil {
        fmt.Println("Error: %s\n", err)
        return
    }
    for _, line := range lines {
        fmt.Println(line)
    }
    //array := []string{"7.0", "8.5", "9.1"}
    err = writeLines(lines, "sqloutput.txt")
    fmt.Println(err)
}