const conn = require('../database');
var fs = require('fs');
var { uploader } = require('../helpers/uploader')

module.exports = {
    getListBrand: (req,res) => {
        var sql = 'SELECT * from brand;';
        conn.query(sql, (err, results) => {
            if(err) throw err;
            //console.log(results); 
            res.send(results);
           // isi resultsnya array of object
            //dan masuk ke FrondEnd --->> componentDidMount yang (res.data)
        })   
    },
    addBrand:  (req,res) => {
        try { //tidak error tapi memberi tau errornya
           const path = '/brand/images'; //file save path
            const upload = uploader(path, 'PRD').fields([{ name: 'image' }]); //uploader(path, 'default prefix') // image sama kayak frondend dari formData
    
            upload(req, res, (err) => {
                if(err){
                    return res.status(500).json({ message: 'Upload picture failed !', error: err.message });
                }
    
                const { image } = req.files;
                console.log(image) //image sesuai dengan fields
                const imagePath = image ? path + '/' + image[0].filename : null;
                console.log(imagePath)
    
                console.log(req.body.data) //isinya objek JSON
                const data = JSON.parse(req.body.data); //di parse ubah dari JSON ke JavaScript
                console.log(data)
                data.image = imagePath;
                
                var sql = 'INSERT INTO brand SET ?';
                conn.query(sql, data, (err, results) => {
                    if(err) {
                        console.log(err.message)
                        fs.unlinkSync('./public' + imagePath); //untuk menghapus imagenya dari file API kalau terjadi error 
                        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
                    }
                   
                    // Cara 1 
                    console.log(results);
                    sql = 'SELECT * from brand;';
                    conn.query(sql, (err, results) => {
                        if(err) {
                            console.log(err.message);
                            return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
                        }
                        console.log(results);
                        
                        res.send(results);
                        
                    //Cara 2
                    //res.send('Add Image Success')
                    })   
                })    
            })
        } catch(err) {
            return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
        }
    },
    editBrand: (req,res) => {
        var brandId = req.params.id;
        var sql = `SELECT * from brand where id = ${brandId};`;
        conn.query(sql, (err, results) => { // isi resultsnya array of object
            if(err) throw err;
    
            if(results.length > 0) {
                const path = '/brand/images'; //file save path
                const upload = uploader(path, 'PRD').fields([{ name: 'image'}]); //uploader(path, 'default prefix')
    
                upload(req, res, (err) => {
                    if(err){
                        return res.status(500).json({ message: 'Upload brand picture failed !', error: err.message });
                        //kalau ada file yg gak dikirim tidak error 
                    }
    
                    const { image } = req.files;
                    // console.log(image)
                    const imagePath = image ? path + '/' + image[0].filename : null;
                    const data = JSON.parse(req.body.data); 
                    data.image = imagePath;
                    
                    //edit sama insert sama 
    
                    try { 
                        if(imagePath) { //masuk ke if kalau ada image yang dipilih
                            sql = `Update brand set ? where id = ${brandId};`
                            conn.query(sql,data, (err1,results1) => {
                                if(err1) {
                                    fs.unlinkSync('./public' + imagePath); //unlinkSync : hapus image dari folder
                                    return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err1.message });
                                }
                                fs.unlinkSync('./public' + results[0].image); //kalau gak error yg dihapus image sebelumnya 
                                sql = `Select * from brand;`;
                                conn.query(sql, (err2,results2) => {
                                    if(err2) {
                                        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err1.message });
                                    }
    
                                    res.send(results2);
                                })
                            })
                        }
                        else {
                            sql = `Update brand set nama='${data.nama}' where id = ${brandId};`//set nya bisa tanda tanya asal datanya tidak ada propertie image
                            conn.query(sql, (err1,results1) => {
                                if(err1) {
                                    return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err1.message });
                                }
                                sql = `Select * from brand;`;
                                conn.query(sql, (err2,results2) => {
                                    if(err2) {
                                        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err1.message });
                                    }
    
                                    res.send(results2); 
    
                                    //codingnya kurang efektif dan ada select * from brand dua kali 
                                })
                            })
                        }
                    }
                    catch(err){
                        console.log(err.message)
                        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
                    }
                })
            }
        })
    },
    deleteBrand:(req,res) => {
        var brandId = req.params.id;
        var sql = `SELECT * from brand where id = ${brandId};`;
        conn.query(sql, (err, results) => {
            if(err) {
                return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
            }
            
            if(results.length > 0) {
                sql = `DELETE from brand where id = ${brandId};`
                conn.query(sql, (err1,results1) => {
                    if(err1) {
                        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err1.message });
                    }
    
                    fs.unlinkSync('./public' + results[0].image);
                    sql = `SELECT * from brand;`;
                    conn.query(sql, (err2,results2) => {
                        if(err2) {
                            return res.status(500).json({ message: "There's an error on the server. Please contact the administrator.", error: err2.message });
                        }
    
                        res.send(results2);
                    })
                })
            }
        })   
    
    }
    
}