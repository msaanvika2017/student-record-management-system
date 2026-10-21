package com.example.studentmanagement.student;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student create(StudentRequest request) {
        if (studentRepository.existsByRollNumber(request.rollNumber())) {
            throw new DuplicateRollNumberException(request.rollNumber());
        }
        return save(new Student(request.name(), request.rollNumber(), request.branch(), request.marks()));
    }

    @Transactional(readOnly = true)
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Student findById(Long id) {
        return getStudent(id);
    }

    public Student update(Long id, StudentRequest request) {
        Student student = getStudent(id);
        if (studentRepository.existsByRollNumberAndIdNot(request.rollNumber(), id)) {
            throw new DuplicateRollNumberException(request.rollNumber());
        }
        student.setName(request.name());
        student.setRollNumber(request.rollNumber());
        student.setBranch(request.branch());
        student.setMarks(request.marks());
        return save(student);
    }

    public void delete(Long id) {
        studentRepository.delete(getStudent(id));
    }

    private Student getStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    private Student save(Student student) {
        try {
            return studentRepository.saveAndFlush(student);
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateRollNumberException(student.getRollNumber());
        }
    }
}