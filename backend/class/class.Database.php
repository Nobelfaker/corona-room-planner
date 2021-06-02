<?php


class Database {

    private $db;

    public function __construct () {
        $this->connect();
    }

    private function connect () {
        $this->db = mysqli_connect("localhost", "root", "", "crp")
                        or die("ERROR:" . mysqli_connect_error());
        $this->db->query("SET NAMES 'utf8';");
    }

    public function getConnection () {
        return $this->db;
    }

}